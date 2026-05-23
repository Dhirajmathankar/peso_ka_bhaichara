const { parseNotificationText } = require('./utils/parser'); // हेल्प फंक्शन (नीचे बनाया है)

module.exports = function (io) {
  io.on("connection", (socket) => {
    // 1. कनेक्शन के समय क्वेरी पैरामीटर्स से userId और activeTripId निकालना
    const { userId, activeTripId } = socket.handshake.query;

    if (!userId) {
      console.log(`❌ Connection rejected: Missing userId`);
      return socket.disconnect();
    }

    // 2. यूज़र को उसके पर्सनल रूम में जॉइन करवाना
    socket.join(`user_${userId}`);
    console.log(`👤 User Connected: ${userId} joined personal room: user_${userId}`);

    // 3. अगर यूज़र किसी एक्टिव ट्रिप ग्रुप के अंदर है, तो उसे उस ग्रुप के रूम में भी डालो
    if (activeTripId) {
      socket.join(`trip_${activeTripId}`);
      console.log(`✈️ User ${userId} joined Trip Room: trip_${activeTripId}`);
    }

    // 👥 डायनेमिकली नए ट्रिप ग्रुप रूम को जॉइन करने के लिए इवेंट (जब यूजर ऐप में ग्रुप बदले)
    socket.on("join_trip_room", ({ tripId }) => {
      if (tripId) {
        socket.join(`trip_${tripId}`);
        console.log(`🔄 User ${userId} switched to Trip Room: trip_${tripId}`);
      }
    });

    // 🔥 एंड्रॉइड ऐप से आने वाला लाइव नोटिफिकेशन ट्रिगर
    socket.on("live_notification_trigger", async (data) => {
      console.log(`📥 Notification captured for User [${userId}]:`, data.body);

      // Regex की मदद से अमाउंट और मर्चेंट/दोस्त का नाम निकालना
      const parsedData = parseNotificationText(data.body);

      const payload = {
        appPackage: data.appPackage,
        title: data.title,
        rawBody: data.body,
        amount: parsedData.amount,     // एक्सट्रेक्टेड अमाउंट (e.g., 500)
        merchant: parsedData.merchant, // एक्सट्रेक्टेड नाम (e.g., Ramesh)
        timestamp: data.timestamp || Date.now()
      };

      // 🚨 केस 1: अगर डेटा में किसी ट्रिप ग्रुप की आईडी मैप्ड है (या करंट एक्टिव ट्रिप है)
      // तो यह पूरे ग्रुप के दोस्तों को लाइव अपडेट भेजेगा
      if (activeTripId) {
        io.to(`trip_${activeTripId}`).emit("ui_notification_update", {
          ...payload,
          isGroupExpense: true,
          tripId: activeTripId
        });
        console.log(`📢 Group Broadcast sent to trip_${activeTripId}`);
      } 
      // 🚨 केस 2: अगर यह पर्सनल खर्च है, तो सिर्फ और सिर्फ उसी यूजर को भेजो जिसने स्पेंड किया है
      else {
        io.to(`user_${userId}`).emit("ui_notification_update", {
          ...payload,
          isGroupExpense: false
        });
        console.log(`🔒 Private Broadcast sent to single user room: user_${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 User ${userId} disconnected`);
    });
  });
};
import { useState } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSend = async () => {
  if (!message.trim()) return;

  try {
    const response = await fetch(
      "http://localhost:5000/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      }
    );

    const data = await response.json();

    console.log("Chatbot response:", data);

    setMessage("");
  } catch (error) {
    console.error("Chatbot error:", error);
  }
};

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg transition hover:scale-105"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-4 text-white">
            <div>
              <h3 className="font-semibold">Civi Assistant</h3>
              <p className="text-xs opacity-80">
                How can we help you?
              </p>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-xl"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="max-w-[80%] rounded-lg bg-white p-3 text-sm shadow-sm">
              👋 Hello! I'm Civi Assistant.
              <br />
              How can I help you today?
            </div>
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t bg-white p-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleSend}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
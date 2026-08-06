const fs = require('fs');

const css = `
/* Telegram Chat Bubbles */
.chat-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.chat-bubble {
  position: relative;
  padding: 8px 12px;
  border-radius: 16px;
  font-size: 14px;
  max-width: 80%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

/* Outgoing (Self) */
.chat-bubble.out {
  background-color: #EFFFDE;
  color: #000;
  border-bottom-right-radius: 4px;
  align-self: flex-end;
}

/* Incoming (Other) */
.chat-bubble.in {
  background-color: #ffffff;
  color: #000;
  border-bottom-left-radius: 4px;
  align-self: flex-start;
}

[data-theme='dark'] .chat-bubble.out {
  background-color: #2B5278;
  color: #fff;
}

[data-theme='dark'] .chat-bubble.in {
  background-color: #182533;
  color: #fff;
}

.chat-sender {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
  opacity: 0.8;
}

.chat-text {
  white-space: pre-wrap;
  word-break: break-word;
  padding-bottom: 12px;
  min-width: 60px;
}

.chat-time {
  position: absolute;
  bottom: 4px;
  right: 8px;
  font-size: 10px;
  display: flex;
  align-items: center;
  gap: 2px;
}

[dir='rtl'] .chat-time {
  right: auto;
  left: 8px;
}

[dir='rtl'] .chat-bubble.out {
  border-bottom-right-radius: 16px;
  border-bottom-left-radius: 4px;
}

[dir='rtl'] .chat-bubble.in {
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 4px;
}

.chat-time.out {
  color: #4ea844;
}
.chat-time.in {
  color: #a0a0a0;
}
[data-theme='dark'] .chat-time.out {
  color: #7bb581;
}
[data-theme='dark'] .chat-time.in {
  color: #7a8a9a;
}
`;

fs.appendFileSync('frontend/src/index.css', css);
console.log('CSS Appended');

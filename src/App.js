import React, { useState } from 'react';
import './App.scss';

function App() {
  const [fileName, setFileName] = useState('');
  const [messages, setMessages] = useState([]);
  const [isParsed, setIsParsed] = useState(false);
  const [onParsing, setOnParsing] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberCount, setMemberCount] = useState(0);
  const [memberList, setMemberList] = useState([]);

  const getMemberNameAndCount = (line) => {
    const memberIsOne = !Array.isArray(line.match(/\d+\s님과 카카오톡 대화$/));
    if (memberIsOne) {
      const name = line.match(/(.+)( 님과 카카오톡 대화$)/)[1];
      setMemberName(name);
    } else {
      const count =
        line.match(/\d+\s님과 카카오톡 대화$/)[0].match(/^\d+/)[0] - 1;
      const list = line.match(/(.+)( \d+ 님과 카카오톡 대화$)/)[1].split(',');
      setMemberCount(count);
      setMemberList(list);
    }
  };

  const readFile = ({ target: { files } }) => {
    setFileName(files[0].name);
    setOnParsing(true);
    const fileReader = new FileReader(files[0]);

    fileReader.readAsText(files[0]);
    fileReader.onload = ({ target: { result } }) => parseFile(result);
  };

  const parseFile = (text) => {
    const allLines = text.split(/\r\n/);
    const messages = [];
    let message = {};
    let started = false;
    let createdAt = '';

    allLines.forEach((line, index) => {
      if (index === 0) {
        getMemberNameAndCount(line);
      } else {
        const firstTokenIndex = line.indexOf(',');
        if (firstTokenIndex !== -1) {
          const date = line
            .substring(0, firstTokenIndex)
            .match(/(.+일) (.+)/)[1];
          const time = line
            .substring(0, firstTokenIndex)
            .match(/(.+일) (.+)/)[2];
          const remain = line.substring(firstTokenIndex + 1).trim();
          const secondTokenIndex = remain.indexOf(':');
          const name = remain.substring(0, secondTokenIndex).trim();
          const content = remain.substring(secondTokenIndex + 1).trim();

          if (createdAt === date) {
            message[date].push({ name, content, time });
          } else {
            if (started) {
              messages.push(message);
              message = {};
              message[date] = [{ name, content, time }];
            } else {
              message[date] = [{ name, content, time }];
              started = true;
            }
            createdAt = date;
          }
        }
      }
    });

    setMessages(messages);
    setIsParsed(true);
    setOnParsing(false);
  };

  const renderFile = (messages) => {
    return (
      <div className="messages-container">
        {messages.map((message) => {
          const date = Object.keys(message);

          return (
            <div className="message-container">
              <div className="date">{date}</div>
              {message[date].map((item) =>
                item.name === '회원님' ? (
                  <div className="mine">
                    <div className="mine-col">
                      <div className="mine-createdAt">{item.time}</div>
                    </div>
                    <div className="mine-col">
                      <div className="mine-content">{item.content}</div>
                    </div>
                  </div>
                ) : (
                  <div className="others">
                    <div className="others-col">
                      <div className="others-profile"></div>
                    </div>
                    <div className="others-col">
                      <div className="others-name">{item.name}</div>
                      <div className="others-wrapper">
                        <div className="others-content">{item.content}</div>
                        <div className="others-createdAt">{item.time}</div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="app">
      <header>
        <div className="container">
          <div className="inner-header">Restory</div>
        </div>
      </header>
      <div className="banner"></div>
      <div className="input-container">
        <div className="container">
          <form>
            <div className="input-row">
              <label htmlFor="file">File</label>
              <input className="file-name" value={fileName} readOnly />
              <div className="file-upload">
                <input
                  type="button"
                  className="file-upload-button"
                  value="찾아보기"
                />
                <input
                  type="file"
                  className="file-input-hidden"
                  onChange={readFile}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
      <section className="render-container">
        <div className="container">{isParsed && renderFile(messages)}</div>
      </section>
      <div
        className={
          onParsing
            ? 'loading-modal-container active'
            : 'loading-modal-container'
        }
      >
        <span></span>
        <span></span>
        <span></span>
        Loading ...
      </div>
      <footer>
        <div className="container">
          <div className="inner-footer">
            <div>ⓒ Whitebrew, Inc. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

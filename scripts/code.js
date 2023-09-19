// an Chat plugin of AI
(function (window, undefined) {
    let ApiKey = '';
    let hasKey = false;
    let messageHistory = null;
    let conversationHistory = null;
    let messageInput = null;
    let typingIndicator = null;

    function checkApiKey() {
        ApiKey = localStorage.getItem('apikey');
        if (ApiKey) {
            hasKey = true;
        } else {
            hasKey = false;
            displayMessage(generateText('Set Your ZhiPu API Key first'), 'ai-message');
        }
    };


    window.Asc.plugin.init = function () {
        messageHistory = document.querySelector('.message-history');
        conversationHistory = [];
        typingIndicator = document.querySelector('.typing-indicator');
        checkApiKey();
    };

    window.Asc.plugin.button = function () {
        this.executeCommand("close", "");
    };

    function getContextMenuItems() {
        let settings = {
            guid: window.Asc.plugin.guid,
            items: [
                {
                    id: 'ZhiPu Copilot',
                    text: generateText('ZhiPu Copilot'),
                    items: [
                        {
                            id: 'generate',
                            text: generateText('generate'),
                        },
                        {
                            id: 'summarize',
                            text: generateText('summarize'),
                        },
                        {
                            id: 'explain',
                            text: generateText('explain'),
                        },
                        {
                            id: 'translate',
                            text: generateText('translate'),
                            items: [
                                {
                                    id: 'translate_to_en',
                                    text: generateText('translate to English'),
                                },
                                {
                                    id: 'translate_to_zh',
                                    text: generateText('translate to Chinese'),
                                },
                                {
                                    id: 'translate_to_fr',
                                    text: generateText('translate to French'),
                                },
                                {
                                    id: 'translate_to_de',
                                    text: generateText('translate to German'),
                                },
                                {
                                    id: 'translate_to_ru',
                                    text: generateText('translate to Russian'),
                                },
                                {
                                    id: 'translate_to_es',
                                    text: generateText('translate to Spanish'),
                                }
                            ]
                        },
                        {
                            id: 'clear_history',
                            text: generateText('clear chat history'),
                        }
                    ]
                }
            ]
        }
        return settings;
    }

    window.Asc.plugin.attachEvent('onContextMenuShow', function (options) {
        if (!options) return;

        if (options.type === 'Selection' || options.type === 'Target')
            this.executeMethod('AddContextMenuItem', [getContextMenuItems()]);
    });

    window.Asc.plugin.attachContextMenuClickEvent('clear_history', function () {
        clearHistory();
    });

    const displayMessage = function (message, messageType) {
        message = message.replace(/^"|"$/g, ''); // remove surrounding quotes
        message = message.replace(/\\n/g, '\n'); // replace \n with newline characters

        // create a new message element
        const messageElement = document.createElement('div');
        messageElement.classList.add(messageType); // Add a class for user messages

        // split the message into lines and create a text node for each line
        const lines = message.split('\n');
        for (const line of lines) {
            const textNode = document.createTextNode(line);
            messageElement.appendChild(textNode);
            messageElement.appendChild(document.createElement('br'));
        }

        // add the message element to the message history
        messageHistory.appendChild(messageElement);

        //  scroll to the bottom of the message history
        messageHistory.scrollTop = messageHistory.scrollHeight;

        conversationHistory.push({ role: messageType === 'user-message' ? 'user' : 'assistant', content: message });
        // console.log("对话历史:", JSON.stringify(conversationHistory));
    };



    // 总结
    window.Asc.plugin.attachContextMenuClickEvent('summarize', function () {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function (text) {
            conversationHistory.push({ role: 'user', content: '总结下面的文本' + text });
            let response = generateResponse();
            response.then(function (res) {
                displayMessage(res, 'ai-message');
            });
        });
    });

    // explain 
    window.Asc.plugin.attachContextMenuClickEvent('explain', function () {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function (text) {
            conversationHistory.push({ role: 'user', content: '解释下面的文本' + text });
            let response = generateResponse();
            response.then(function (res) {
                displayMessage(res, 'ai-message');
            });
        });
    });

    const translateHelper = function (text, targetLanguage) {
        console.log(`将下面的文本翻译为${targetLanguage}：`, text);
        conversationHistory.push({ role: 'user', content: `将下面的文本翻译为${targetLanguage}：` + text });
        let response = generateResponse();
        response.then(function (res) {
            displayMessage(res, 'ai-message');
        });
    }

    // translate into Chinese
    window.Asc.plugin.attachContextMenuClickEvent('translate_to_zh', function () {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function (text) {
            translateHelper(text, "中文");
        });
    });

    // translate into English
    window.Asc.plugin.attachContextMenuClickEvent('translate_to_en', function () {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function (text) {
            translateHelper(text, "英文");
        });
    });

    // translate to French
    window.Asc.plugin.attachContextMenuClickEvent('translate_to_fr', function () {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function (text) {
            translateHelper(text, "法文");
        });
    });

    // translate to German
    window.Asc.plugin.attachContextMenuClickEvent('translate_to_de', function () {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function (text) {
            translateHelper(text, "德文");
        });
    });

    // translate to Russian
    window.Asc.plugin.attachContextMenuClickEvent('translate_to_ru', function () {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function (text) {
            translateHelper(text, "俄文");
        });
    });

    // translate to spanish
    window.Asc.plugin.attachContextMenuClickEvent('translate_to_es', function () {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function (text) {
            translateHelper(text, "西班牙文");
        });
    });

    // generate content directly in document
    window.Asc.plugin.attachContextMenuClickEvent('generate', function () {
        window.Asc.plugin.executeMethod('GetSelectedText', null, function (text) {
            conversationHistory.push({ role: 'user', content: '请根据指令生成对应文本：' + text });
            let response = generateResponse();
            response.then(function (res) {
                conversationHistory.push({ role: 'assistant', content: res });
                Asc.scope.paragraphs = res.slice(1, -1).split('\\n');
                Asc.scope.st = Asc.scope.paragraphs;
                Asc.plugin.callCommand(function () {
                    var oDocument = Api.GetDocument();
                    for (var i = 0; i < Asc.scope.st.length; i++) {
                        var oParagraph = Api.CreateParagraph();
                        oParagraph.AddText(Asc.scope.st[i]);
                        oDocument.InsertContent([oParagraph]);
                    }
                }, false);
            });
        });

    });

    // generate async request (for in-doc function)
    let generateResponse = async function () {
        let prompt = {
            "prompt": conversationHistory
        }
        let res = await window.Asc.sendRequest(prompt);
        console.log("获得回复：", res)
        return res;
    }

    // Make sure the DOM is fully loaded before running the following code
    document.addEventListener("DOMContentLoaded", function () {
        // get references to the DOM elements
        messageInput = document.querySelector('.message-input');
        const sendButton = document.querySelector('.send-button');
        typingIndicator = document.querySelector('.typing-indicator');

        // send a message when the user clicks the send button
        async function sendMessage() {
            const message = messageInput.value;
            if (message.trim() !== '') {
                displayMessage(message, 'user-message'); // create a new user message element
                messageInput.value = ''; // clear the message input
                typingIndicator.style.display = 'block'; // display the typing indicator
                // const aiResponse = await generateResponse();
                const reader = await sseRequest(conversationHistory);
                typingIndicator.style.display = 'none'; // hide the typing indicator
                // displayMessage(aiResponse, 'ai-message'); // create a new assistant message element
                displaySSEMessage(reader);
            }
        }

        sendButton.addEventListener('click', sendMessage);

        messageInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();  // prevent the default behavior of the Enter key
                if (event.shiftKey) {
                    // if the user pressed Shift+Enter, insert a newline character
                    messageInput.value += '\n';
                } else {
                    // if the user only pressed Enter, send the message
                    sendMessage();
                }
            }
        });
    });

    function clearHistory() {
        messageHistory.innerHTML = '';
        conversationHistory = [];
        messageInput.value = '';
    }


    async function sseRequest(conversationHistory) {
        console.log("history: ", conversationHistory);
        const jwt = window.Asc.JWT;
        console.log("SSE请求开始");
        const model = localStorage.getItem('model');
        const url = `https://open.bigmodel.cn/api/paas/v3/model-api/${model}/sse-invoke`;

        const headers = {
            'Accept': 'text/event-stream',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwt
        };

        const requestData = {
            prompt: conversationHistory
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData)
        });

        return response.body.pipeThrough(new TextDecoderStream()).getReader();
    }

    // show SSE result on page
    async function displaySSEMessage(reader) {
        let currentDiv = null;
        let currentMessage = null;
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value.includes('finish' || 'error' || 'interrupt')) {
                console.log(value);
                currentDiv = null;
                break;
            }
            if (currentDiv === null) {
                currentDiv = document.createElement('div');
                currentDiv.classList.add('ai-message');
                messageHistory.appendChild(currentDiv);
            };
            const lines = value.split('\n');
            lines.forEach(line => {
                if (line.includes('data')) {
                    const fragment = line.split(':')[1];
                    currentMessage += fragment;
                    if (fragment === '') {
                        currentDiv.appendChild(document.createElement('br'));
                    } else {
                        currentDiv.appendChild(document.createTextNode(fragment));
                    }
                }
            });
        }

        conversationHistory.push({ role: 'assistant', content: currentMessage });
    }


    function generateText(text) {
		let lang = window.Asc.plugin.info.lang.substring(0,2);
        console.log("current lang: ", lang);
		return {
			en: text,
			[lang]: window.Asc.plugin.tr(text)
		}
	};

})(window, undefined);

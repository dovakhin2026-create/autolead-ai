// AutoLead.ai Chatbot Widget
class AutoLeadChatbot {
    constructor() {
        this.isOpen = false;
        this.currentStep = 0;
        this.userData = {
            projectType: '',
            budget: '',
            timing: '',
            name: '',
            email: '',
            phone: ''
        };
        this.init();
    }

    init() {
        this.injectStyles();
        this.createWidget();
        this.attachEventListeners();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .autolead-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            .autolead-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: #00ff87;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(0, 255, 135, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 28px;
                transition: transform 0.3s;
            }

            .autolead-button:hover {
                transform: scale(1.1);
            }

            .autolead-chat {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 380px;
                height: 550px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 10px 50px rgba(0, 0, 0, 0.3);
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            .autolead-chat.open {
                display: flex;
            }

            .autolead-header {
                background: #0a0a0a;
                color: white;
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .autolead-header h3 {
                margin: 0;
                font-size: 18px;
            }

            .autolead-close {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
            }

            .autolead-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #f8f8f8;
            }

            .autolead-message {
                margin-bottom: 15px;
                animation: fadeIn 0.3s;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .autolead-message.bot {
                background: white;
                padding: 15px;
                border-radius: 12px;
                max-width: 80%;
            }

            .autolead-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 10px;
            }

            .autolead-option {
                background: #00ff87;
                color: #0a0a0a;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s;
            }

            .autolead-option:hover {
                transform: translateX(5px);
                box-shadow: 0 2px 10px rgba(0, 255, 135, 0.3);
            }

            .autolead-input-group {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 10px;
            }

            .autolead-input {
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 14px;
            }

            .autolead-input:focus {
                outline: none;
                border-color: #00ff87;
            }

            .autolead-submit {
                background: #00ff87;
                color: #0a0a0a;
                border: none;
                padding: 12px;
                border-radius: 8px;
                font-weight: 700;
                cursor: pointer;
            }

            @media (max-width: 480px) {
                .autolead-chat {
                    width: calc(100vw - 40px);
                    height: calc(100vh - 120px);
                    bottom: 90px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'autolead-widget';
        widget.innerHTML = `
            <button class="autolead-button" id="autolead-open">
                💬
            </button>
            <div class="autolead-chat" id="autolead-chat">
                <div class="autolead-header">
                    <h3>AutoLead.ai</h3>
                    <button class="autolead-close" id="autolead-close">×</button>
                </div>
                <div class="autolead-messages" id="autolead-messages"></div>
            </div>
        `;
        document.body.appendChild(widget);
    }

    attachEventListeners() {
        document.getElementById('autolead-open').addEventListener('click', () => this.open());
        document.getElementById('autolead-close').addEventListener('click', () => this.close());
    }

    open() {
        this.isOpen = true;
        document.getElementById('autolead-chat').classList.add('open');
        if (this.currentStep === 0) {
            this.startConversation();
        }
    }

    close() {
        this.isOpen = false;
        document.getElementById('autolead-chat').classList.remove('open');
    }

    addMessage(text, isBot = true) {
        const messagesDiv = document.getElementById('autolead-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `autolead-message ${isBot ? 'bot' : 'user'}`;
        messageDiv.innerHTML = `<p>${text}</p>`;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    addOptions(options, callback) {
        const messagesDiv = document.getElementById('autolead-messages');
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'autolead-options';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'autolead-option';
            button.textContent = option;
            button.addEventListener('click', () => {
                callback(option);
                optionsDiv.remove();
            });
            optionsDiv.appendChild(button);
        });
        
        messagesDiv.appendChild(optionsDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    addInputForm(fields, callback) {
        const messagesDiv = document.getElementById('autolead-messages');
        const formDiv = document.createElement('div');
        formDiv.className = 'autolead-input-group';
        
        const inputs = {};
        fields.forEach(field => {
            const input = document.createElement('input');
            input.className = 'autolead-input';
            input.type = field.type;
            input.placeholder = field.placeholder;
            input.required = true;
            inputs[field.name] = input;
            formDiv.appendChild(input);
        });
        
        const submit = document.createElement('button');
        submit.className = 'autolead-submit';
        submit.textContent = 'Send';
        submit.addEventListener('click', () => {
            const data = {};
            let valid = true;
            
            Object.keys(inputs).forEach(key => {
                if (!inputs[key].value) {
                    valid = false;
                    inputs[key].style.borderColor = 'red';
                } else {
                    data[key] = inputs[key].value;
                }
            });
            
            if (valid) {
                callback(data);
                formDiv.remove();
            }
        });
        
        formDiv.appendChild(submit);
        messagesDiv.appendChild(formDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    startConversation() {
        this.currentStep = 1;
        this.addMessage("Hello! 👋 I'm the AutoLead.ai assistant. I'll help you qualify your project. What type of service are you looking for?");
        
        this.addOptions([
            'Lead Generation',
            'Customer Support',
            'E-commerce',
            'Booking/Reservations',
            'Other'
        ], (choice) => {
            this.userData.projectType = choice;
            this.askBudget();
        });
    }

    askBudget() {
        this.currentStep = 2;
        this.addMessage("Perfect! What is your monthly budget for this service?");
        
        this.addOptions([
            'Less than $100',
            '$100-300',
            '$300-500',
            'More than $500'
        ], (choice) => {
            this.userData.budget = choice;
            this.askTiming();
        });
    }

    askTiming() {
        this.currentStep = 3;
        this.addMessage("Excellent! When would you like to start?");
        
        this.addOptions([
            'This week',
            'This month',
            'In 2-3 months',
            'Just a quote'
        ], (choice) => {
            this.userData.timing = choice;
            this.askContact();
        });
    }

    askContact() {
        this.currentStep = 4;
        this.addMessage("Great! To finalize, I need your contact details to get back to you:");
        
        this.addInputForm([
            { name: 'name', type: 'text', placeholder: 'Your name' },
            { name: 'email', type: 'email', placeholder: 'Email' },
            { name: 'phone', type: 'tel', placeholder: 'Phone' }
        ], (data) => {
            this.userData = { ...this.userData, ...data };
            this.sendLead();
        });
    }

    async sendLead() {
        this.addMessage("⏳ Sending your request...");
        
        try {
            // Send to Netlify Function
            const response = await fetch('/.netlify/functions/submit-lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.userData.name,
                    email: this.userData.email,
                    phone: this.userData.phone,
                    company: '',
                    message: `Project Type: ${this.userData.projectType}\nBudget: ${this.userData.budget}\nTiming: ${this.userData.timing}`
                })
            });
            
            if (response.ok) {
                this.addMessage("✅ Thank you! Your request has been submitted. We'll contact you within 24 hours to discuss your project!");
                setTimeout(() => {
                    this.addMessage("In the meantime, feel free to explore our site to learn more about AutoLead.ai! 🚀");
                }, 2000);
            } else {
                throw new Error('Failed to submit');
            }
        } catch (error) {
            console.error('Error sending lead:', error);
            this.addMessage("⚠️ There was an issue submitting your request. Please try again or email us directly at dovakhin2026@gmail.com");
        }
    }
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new AutoLeadChatbot());
} else {
    new AutoLeadChatbot();
}

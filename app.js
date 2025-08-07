// WhatsApp-like Chat Application JavaScript
class ChatApp {
    constructor() {
        this.currentUser = null;
        this.currentChat = null;
        this.users = [];
        this.groups = [];
        this.messages = [];
        this.companySettings = {
            name: "TechCorp Inc.",
            logo: null,
            appEnabled: true,
            disableUntil: null,
            disableReason: ""
        };
        
        this.init();
        // Force app to always be enabled on startup
this.companySettings.appEnabled = true;
this.companySettings.disableUntil = null;
this.companySettings.disableReason = "";
this.saveData();

// Hide disabled screen immediately  
const disabledScreen = document.getElementById('appDisabledScreen');
if (disabledScreen) {
    disabledScreen.classList.add('hidden');
}
    }

    init() {
        // FORCE app to be enabled and hide disabled screen immediately
        this.companySettings.appEnabled = true;
        this.companySettings.disableUntil = null;
        this.companySettings.disableReason = "";
        
        // Hide disabled screen first thing
        const disabledScreen = document.getElementById('appDisabledScreen');
        if (disabledScreen) {
            disabledScreen.classList.add('hidden');
        }
        
        this.loadData();
        this.setupEventListeners();
        this.updateCompanyBranding();
        
        // Show login screen
        const loginScreen = document.getElementById('loginScreen');
        const chatApp = document.getElementById('chatApp');
        
        if (loginScreen && chatApp) {
            loginScreen.classList.remove('hidden');
            chatApp.classList.add('hidden');
        }
        
        // Start real-time updates
        this.startRealTimeUpdates();
        
        console.log('Chat app initialized successfully');
    }

    loadData() {
        // Load from localStorage or use default data
        const savedUsers = localStorage.getItem('chatApp_users');
        const savedMessages = localStorage.getItem('chatApp_messages');
        const savedGroups = localStorage.getItem('chatApp_groups');
        const savedSettings = localStorage.getItem('chatApp_settings');

        this.users = savedUsers ? JSON.parse(savedUsers) : [
            {"id": 1, "name": "John Admin", "phone": "+1234567890", "role": "admin", "status": "online", "avatar": "👨‍💼", "lastSeen": "2025-08-07T12:00:00Z"},
            {"id": 2, "name": "Sarah Manager", "phone": "+1234567891", "role": "user", "status": "online", "avatar": "👩‍💼", "lastSeen": "2025-08-07T11:55:00Z"},
            {"id": 3, "name": "Mike Developer", "phone": "+1234567892", "role": "user", "status": "away", "avatar": "👨‍💻", "lastSeen": "2025-08-07T11:30:00Z"},
            {"id": 4, "name": "Lisa Designer", "phone": "+1234567893", "role": "user", "status": "online", "avatar": "👩‍🎨", "lastSeen": "2025-08-07T11:58:00Z"},
            {"id": 5, "name": "Tom Support", "phone": "+1234567894", "role": "user", "status": "offline", "avatar": "👨‍🔧", "lastSeen": "2025-08-07T09:00:00Z"}
        ];

        this.messages = savedMessages ? JSON.parse(savedMessages) : [
            {"id": 1, "senderId": 2, "receiverId": 1, "content": "Hi John, can we schedule a meeting for tomorrow?", "timestamp": "2025-08-07T10:30:00Z", "type": "text"},
            {"id": 2, "senderId": 1, "receiverId": 2, "content": "Sure Sarah! How about 2 PM?", "timestamp": "2025-08-07T10:32:00Z", "type": "text"},
            {"id": 3, "senderId": 3, "receiverId": 1, "content": "The new feature is ready for review @John Admin", "timestamp": "2025-08-07T11:00:00Z", "type": "text"},
            {"id": 4, "senderId": 4, "groupId": 1, "content": "I've updated the design mockups", "timestamp": "2025-08-07T11:15:00Z", "type": "text"},
            {"id": 5, "senderId": 1, "groupId": 1, "content": "Great work team! 🎉", "timestamp": "2025-08-07T11:20:00Z", "type": "text"}
        ];

        this.groups = savedGroups ? JSON.parse(savedGroups) : [
            {"id": 1, "name": "Development Team", "members": [1, 3, 4], "admin": 1, "avatar": "👥", "description": "Main development team discussions"},
            {"id": 2, "name": "Management", "members": [1, 2], "admin": 1, "avatar": "🏢", "description": "Management team coordination"}
        ];

        // Only load name and logo from settings, never load disabled state
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.companySettings.name = settings.name || this.companySettings.name;
            this.companySettings.logo = settings.logo || this.companySettings.logo;
        }
    }

    saveData() {
        localStorage.setItem('chatApp_users', JSON.stringify(this.users));
        localStorage.setItem('chatApp_messages', JSON.stringify(this.messages));
        localStorage.setItem('chatApp_groups', JSON.stringify(this.groups));
        
        // Only save name and logo, never save disabled state
        const settingsToSave = {
            name: this.companySettings.name,
            logo: this.companySettings.logo,
            appEnabled: true,
            disableUntil: null,
            disableReason: ""
        };
        localStorage.setItem('chatApp_settings', JSON.stringify(settingsToSave));
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Settings
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        // New Group
        const newGroupBtn = document.getElementById('newGroupBtn');
        if (newGroupBtn) {
            newGroupBtn.addEventListener('click', () => {
                this.showNewGroupModal();
            });
        }

        // Message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            // Auto-resize message input
            messageInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            });
        }

        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // Emoji picker
        const emojiBtn = document.getElementById('emojiBtn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => {
                this.toggleEmojiPicker();
            });
        }

        // File attachment
        const attachBtn = document.getElementById('attachBtn');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => {
                document.getElementById('fileInput').click();
            });
        }

        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }

        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterContacts(e.target.value);
            });
        }

        // Chat info
        const chatInfoBtn = document.getElementById('chatInfoBtn');
        if (chatInfoBtn) {
            chatInfoBtn.addEventListener('click', () => {
                this.toggleChatInfo();
            });
        }

        // Modal close buttons
        const closeSettings = document.getElementById('closeSettings');
        if (closeSettings) {
            closeSettings.addEventListener('click', () => {
                this.hideModal('settingsModal');
            });
        }

        const closeNewGroup = document.getElementById('closeNewGroup');
        if (closeNewGroup) {
            closeNewGroup.addEventListener('click', () => {
                this.hideModal('newGroupModal');
            });
        }

        const closeAddUser = document.getElementById('closeAddUser');
        if (closeAddUser) {
            closeAddUser.addEventListener('click', () => {
                this.hideModal('addUserModal');
            });
        }

        const closeDisableModal = document.getElementById('closeDisableModal');
        if (closeDisableModal) {
            closeDisableModal.addEventListener('click', () => {
                this.hideModal('disableAppModal');
            });
        }

        const closeChatInfo = document.getElementById('closeChatInfo');
        if (closeChatInfo) {
            closeChatInfo.addEventListener('click', () => {
                this.hideChatInfo();
            });
        }

        // Settings save
        const saveSettings = document.getElementById('saveSettings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // Create group
        const createGroupBtn = document.getElementById('createGroupBtn');
        if (createGroupBtn) {
            createGroupBtn.addEventListener('click', () => {
                this.createGroup();
            });
        }

        // Add user
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.addUser();
            });
        }

        // Admin controls - remove disable functionality for demo
        const toggleAppBtn = document.getElementById('toggleAppBtn');
        if (toggleAppBtn) {
            toggleAppBtn.addEventListener('click', () => {
                this.showNotification('Demo Mode', 'App disable functionality is disabled in demo mode for testing purposes', 'info');
            });
        }

        const confirmDisableApp = document.getElementById('confirmDisableApp');
        if (confirmDisableApp) {
            confirmDisableApp.addEventListener('click', () => {
                this.hideModal('disableAppModal');
                this.showNotification('Demo Mode', 'App disable functionality is disabled in demo mode', 'info');
            });
        }

        const cancelDisableApp = document.getElementById('cancelDisableApp');
        if (cancelDisableApp) {
            cancelDisableApp.addEventListener('click', () => {
                this.hideModal('disableAppModal');
            });
        }

        const deleteAllDataBtn = document.getElementById('deleteAllDataBtn');
        if (deleteAllDataBtn) {
            deleteAllDataBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                    this.resetAllData();
                }
            });
        }

        // Company logo upload
        const companyLogoInput = document.getElementById('companyLogoInput');
        if (companyLogoInput) {
            companyLogoInput.addEventListener('change', (e) => {
                this.handleLogoUpload(e.target.files[0]);
            });
        }

        // Emoji picker clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('emoji-item')) {
                this.insertEmoji(e.target.textContent);
            }
        });

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });

        // Close emoji picker when clicking outside
        document.addEventListener('click', (e) => {
            const emojiPicker = document.getElementById('emojiPicker');
            const emojiButton = document.getElementById('emojiBtn');
            
            if (emojiPicker && emojiButton && !emojiPicker.contains(e.target) && e.target !== emojiButton) {
                emojiPicker.classList.add('hidden');
            }
        });
    }

    updateCompanyBranding() {
        const elements = [
            'companyName', 'headerCompanyName', 'welcomeCompanyName'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.companySettings.name;
            }
        });

        if (this.companySettings.logo) {
            const logoElements = document.querySelectorAll('.company-icon');
            logoElements.forEach(el => {
                el.innerHTML = `<img src="${this.companySettings.logo}" alt="${this.companySettings.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
            });
        }
    }

    handleLogin() {
        const phoneNumber = document.getElementById('phoneNumber').value.trim();
        
        // Validate phone number format
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            this.showError('Please enter a valid phone number (e.g., +1234567890)');
            return;
        }
        
        const user = this.users.find(u => u.phone === phoneNumber);

        if (user) {
            this.currentUser = user;
            this.showChatApp();
            this.renderContactList();
            this.showNotification('Login successful', `Welcome ${user.name}!`, 'success');
            
            // Update user status to online
            user.status = 'online';
            user.lastSeen = new Date().toISOString();
            this.saveData();
        } else {
            this.showError('Phone number not found in company directory. Please contact your administrator.');
        }
    }

    logout() {
        if (this.currentUser) {
            // Update user status to offline
            this.currentUser.status = 'offline';
            this.currentUser.lastSeen = new Date().toISOString();
            this.saveData();
        }
        
        this.currentUser = null;
        this.currentChat = null;
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('chatApp').classList.add('hidden');
        document.getElementById('phoneNumber').value = '';
        
        const loginError = document.getElementById('loginError');
        if (loginError) {
            loginError.classList.add('hidden');
        }
    }

    showChatApp() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('chatApp').classList.remove('hidden');
        document.getElementById('userInfo').textContent = `${this.currentUser.name} (${this.currentUser.role})`;
    }

    renderContactList() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        chatList.innerHTML = '';

        // Render individual users
        this.users.filter(u => u.id !== this.currentUser.id).forEach(user => {
            const chatItem = this.createChatItem(user, 'user');
            chatList.appendChild(chatItem);
        });

        // Render groups
        this.groups.filter(g => g.members.includes(this.currentUser.id)).forEach(group => {
            const chatItem = this.createChatItem(group, 'group');
            chatList.appendChild(chatItem);
        });
    }

    createChatItem(contact, type) {
        const div = document.createElement('div');
        div.className = 'chat-item';
        div.dataset.contactId = contact.id;
        div.dataset.contactType = type;

        const lastMessage = this.getLastMessage(contact.id, type);
        const unreadCount = this.getUnreadCount(contact.id, type);

        div.innerHTML = `
            <span class="contact-avatar">${contact.avatar}</span>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                ${type === 'user' ? `<div class="contact-phone">${contact.phone}</div>` : ''}
                ${type === 'user' ? `<span class="contact-status ${contact.status}">${contact.status}</span>` : `<span class="contact-status">${contact.members.length} members</span>`}
                ${lastMessage ? `<div class="last-message">${lastMessage}</div>` : ''}
            </div>
            ${unreadCount > 0 ? `<span class="unread-count">${unreadCount}</span>` : ''}
        `;

        div.addEventListener('click', () => {
            this.openChat(contact, type);
        });

        return div;
    }

    getLastMessage(contactId, type) {
        let relevantMessages = [];
        
        if (type === 'user') {
            relevantMessages = this.messages.filter(m => 
                (m.senderId === contactId && m.receiverId === this.currentUser.id) ||
                (m.senderId === this.currentUser.id && m.receiverId === contactId)
            );
        } else {
            relevantMessages = this.messages.filter(m => m.groupId === contactId);
        }

        if (relevantMessages.length > 0) {
            const lastMsg = relevantMessages[relevantMessages.length - 1];
            return lastMsg.content.length > 30 ? lastMsg.content.substring(0, 30) + '...' : lastMsg.content;
        }
        return null;
    }

    getUnreadCount(contactId, type) {
        // For demo purposes, return 0
        return 0;
    }

    openChat(contact, type) {
        this.currentChat = { contact, type };
        
        // Update active chat item
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Find and activate the clicked item
        const clickedItem = document.querySelector(`[data-contact-id="${contact.id}"][data-contact-type="${type}"]`);
        if (clickedItem) {
            clickedItem.classList.add('active');
        }

        // Show chat area
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('chatArea').classList.remove('hidden');

        // Update chat header
        document.getElementById('chatContactAvatar').textContent = contact.avatar;
        document.getElementById('chatContactName').textContent = contact.name;
        document.getElementById('chatContactStatus').textContent = type === 'user' ? contact.status : `${contact.members.length} members`;

        this.renderMessages();
    }

    renderMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';

        let relevantMessages = [];
        
        if (this.currentChat.type === 'user') {
            relevantMessages = this.messages.filter(m => 
                (m.senderId === this.currentChat.contact.id && m.receiverId === this.currentUser.id) ||
                (m.senderId === this.currentUser.id && m.receiverId === this.currentChat.contact.id)
            );
        } else {
            relevantMessages = this.messages.filter(m => m.groupId === this.currentChat.contact.id);
        }

        relevantMessages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message ${message.senderId === this.currentUser.id ? 'sent' : 'received'}`;
        div.dataset.messageId = message.id;

        const sender = this.users.find(u => u.id === message.senderId);
        const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let content = this.processMessageContent(message.content);

        div.innerHTML = `
            <div class="message-bubble">
                ${message.senderId !== this.currentUser.id && this.currentChat.type === 'group' ? 
                    `<div class="message-sender">${sender ? sender.name : 'Unknown'}</div>` : ''}
                <div class="message-content">${content}</div>
                <div class="message-time">${time}</div>
                ${message.senderId === this.currentUser.id || this.currentUser.role === 'admin' ? `
                <div class="message-actions">
                    <button class="message-action-btn delete-message-btn" data-message-id="${message.id}">🗑️</button>
                </div>` : ''}
            </div>
        `;

        // Add delete message event listener
        const deleteBtn = div.querySelector('.delete-message-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteMessage(message.id);
            });
        }

        return div;
    }

    processMessageContent(content) {
        // Process @mentions
        const mentionRegex = /@(\w+\s*\w*)/g;
        content = content.replace(mentionRegex, (match, name) => {
            const mentionedUser = this.users.find(u => u.name.toLowerCase().includes(name.toLowerCase()));
            if (mentionedUser) {
                // Trigger notification for mentioned user
                this.triggerMentionNotification(mentionedUser.id, content);
            }
            return `<span class="mention">${match}</span>`;
        });
        
        // Process line breaks
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }

    triggerMentionNotification(userId, message) {
        if (userId === this.currentUser.id) {
            this.showNotification('You were mentioned', message, 'info');
        }
    }

    deleteMessage(messageId) {
        if (!confirm('Are you sure you want to delete this message?')) return;

        this.messages = this.messages.filter(m => m.id !== messageId);
        this.saveData();
        this.renderMessages();
        this.renderContactList();
        this.showNotification('Message deleted', 'The message has been removed.', 'success');
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        if (!input) return;
        
        const content = input.value.trim();

        if (!content || !this.currentChat) return;

        const message = {
            id: Date.now() + Math.random(),
            senderId: this.currentUser.id,
            content: content,
            timestamp: new Date().toISOString(),
            type: 'text'
        };

        if (this.currentChat.type === 'user') {
            message.receiverId = this.currentChat.contact.id;
        } else {
            message.groupId = this.currentChat.contact.id;
        }

        this.messages.push(message);
        this.saveData();

        input.value = '';
        input.style.height = 'auto';
        this.renderMessages();
        this.renderContactList();

        // Simulate notification for other users
        this.simulateNotification(content);
    }

    simulateNotification(message) {
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            setTimeout(() => {
                new Notification(`New message from ${this.currentUser.name}`, {
                    body: message,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y=".9em" font-size="90">💬</text></svg>'
                });
            }, 100);
        }
    }

    toggleEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        if (picker) {
            picker.classList.toggle('hidden');
        }
    }

    insertEmoji(emoji) {
        const input = document.getElementById('messageInput');
        if (!input) return;
        
        const cursorPos = input.selectionStart;
        const textBefore = input.value.substring(0, cursorPos);
        const textAfter = input.value.substring(cursorPos);
        
        input.value = textBefore + emoji + textAfter;
        input.focus();
        input.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
        
        const picker = document.getElementById('emojiPicker');
        if (picker) {
            picker.classList.add('hidden');
        }
    }

    handleFileUpload(files) {
        if (!files.length || !this.currentChat) return;

        Array.from(files).forEach(file => {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                this.showError('File size must be less than 10MB');
                return;
            }

            const message = {
                id: Date.now() + Math.random(),
                senderId: this.currentUser.id,
                content: `📎 ${file.name} (${this.formatFileSize(file.size)})`,
                timestamp: new Date().toISOString(),
                type: 'file',
                fileName: file.name,
                fileSize: file.size
            };

            if (this.currentChat.type === 'user') {
                message.receiverId = this.currentChat.contact.id;
            } else {
                message.groupId = this.currentChat.contact.id;
            }

            this.messages.push(message);
        });

        this.saveData();
        this.renderMessages();
        this.renderContactList();
        this.showNotification('File uploaded', 'File attachment sent successfully', 'success');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    filterContacts(searchTerm) {
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            const name = item.querySelector('.contact-name')?.textContent.toLowerCase() || '';
            const phone = item.querySelector('.contact-phone')?.textContent.toLowerCase() || '';
            
            if (name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm.toLowerCase())) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    toggleChatInfo() {
        const panel = document.getElementById('chatInfoPanel');
        if (panel.classList.contains('hidden')) {
            this.showChatInfo();
        } else {
            this.hideChatInfo();
        }
    }

    showChatInfo() {
        if (!this.currentChat) return;

        const panel = document.getElementById('chatInfoPanel');
        panel.classList.remove('hidden');

        document.getElementById('infoPanelAvatar').textContent = this.currentChat.contact.avatar;
        document.getElementById('infoPanelName').textContent = this.currentChat.contact.name;
        
        if (this.currentChat.type === 'user') {
            document.getElementById('infoPanelPhone').textContent = this.currentChat.contact.phone;
            document.getElementById('groupMembersSection').classList.add('hidden');
        } else {
            document.getElementById('infoPanelPhone').textContent = `${this.currentChat.contact.members.length} members`;
            document.getElementById('groupMembersSection').classList.remove('hidden');
            this.renderGroupMembers();
        }
    }

    hideChatInfo() {
        const panel = document.getElementById('chatInfoPanel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    renderGroupMembers() {
        const membersList = document.getElementById('groupMembersList');
        if (!membersList) return;
        
        membersList.innerHTML = '';

        this.currentChat.contact.members.forEach(memberId => {
            const member = this.users.find(u => u.id === memberId);
            if (member) {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'group-member';
                memberDiv.innerHTML = `
                    <span class="group-member-avatar">${member.avatar}</span>
                    <span>${member.name}</span>
                    ${member.id === this.currentChat.contact.admin ? '<span class="admin-badge">Admin</span>' : ''}
                `;
                membersList.appendChild(memberDiv);
            }
        });
    }

    showSettings() {
        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.classList.remove('hidden');
        }
        
        if (this.currentUser.role === 'admin') {
            const adminControls = document.getElementById('adminControls');
            if (adminControls) {
                adminControls.classList.remove('hidden');
            }
            
            const companyNameInput = document.getElementById('companyNameInput');
            if (companyNameInput) {
                companyNameInput.value = this.companySettings.name;
            }
            
            const toggleAppBtn = document.getElementById('toggleAppBtn');
            if (toggleAppBtn) {
                toggleAppBtn.textContent = 'Disable App (Demo Mode)';
            }
            
            this.renderUserManagement();
            this.renderGroupManagement();
        } else {
            const adminControls = document.getElementById('adminControls');
            if (adminControls) {
                adminControls.classList.add('hidden');
            }
        }
    }

    renderUserManagement() {
        const userList = document.getElementById('userManagementList');
        if (!userList) return;
        
        userList.innerHTML = '';

        // Add user button
        const addUserBtn = document.createElement('button');
        addUserBtn.className = 'btn btn--primary add-user-btn';
        addUserBtn.textContent = 'Add New User';
        addUserBtn.addEventListener('click', () => {
            this.showAddUserModal();
        });
        userList.appendChild(addUserBtn);

        this.users.forEach(user => {
            if (user.id === this.currentUser.id) return;

            const userDiv = document.createElement('div');
            userDiv.className = 'user-item';
            userDiv.innerHTML = `
                <div class="user-item-info">
                    <span class="contact-avatar" style="font-size: 24px; width: 32px; height: 32px;">${user.avatar}</span>
                    <div>
                        <div class="contact-name">${user.name}</div>
                        <div class="contact-phone">${user.phone}</div>
                        <span class="contact-status ${user.status}">${user.status} - ${user.role}</span>
                    </div>
                </div>
                <div class="user-item-actions">
                    <button class="btn btn--outline btn--sm delete-user-btn" data-user-id="${user.id}">Delete</button>
                </div>
            `;
            
            userDiv.querySelector('.delete-user-btn').addEventListener('click', () => {
                this.deleteUser(user.id);
            });
            
            userList.appendChild(userDiv);
        });
    }

    renderGroupManagement() {
        const groupList = document.getElementById('groupManagementList');
        if (!groupList) return;
        
        groupList.innerHTML = '';

        this.groups.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group-item';
            groupDiv.innerHTML = `
                <div class="group-item-info">
                    <span class="contact-avatar" style="font-size: 24px; width: 32px; height: 32px;">${group.avatar}</span>
                    <div>
                        <div class="contact-name">${group.name}</div>
                        <div class="text-small text-muted">${group.members.length} members</div>
                    </div>
                </div>
                <div class="group-item-actions">
                    <button class="btn btn--outline btn--sm delete-group-btn" data-group-id="${group.id}">Delete</button>
                </div>
            `;
            
            groupDiv.querySelector('.delete-group-btn').addEventListener('click', () => {
                this.deleteGroup(group.id);
            });
            
            groupList.appendChild(groupDiv);
        });
    }

    showAddUserModal() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    addUser() {
        const name = document.getElementById('newUserName').value.trim();
        const phone = document.getElementById('newUserPhone').value.trim();
        const role = document.getElementById('newUserRole').value;
        const avatar = document.getElementById('newUserAvatar').value.trim() || '👤';

        if (!name || !phone) {
            this.showError('Please fill in all required fields');
            return;
        }

        // Validate phone number
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phone)) {
            this.showError('Please enter a valid phone number');
            return;
        }

        // Check if phone number already exists
        if (this.users.find(u => u.phone === phone)) {
            this.showError('Phone number already exists');
            return;
        }

        const newUser = {
            id: Date.now(),
            name: name,
            phone: phone,
            role: role,
            status: 'offline',
            avatar: avatar,
            lastSeen: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveData();
        this.renderUserManagement();
        this.renderContactList();
        this.hideModal('addUserModal');
        this.showNotification('User added', `${name} has been added to the system`, 'success');

        // Clear form
        document.getElementById('newUserName').value = '';
        document.getElementById('newUserPhone').value = '';
        document.getElementById('newUserRole').value = 'user';
        document.getElementById('newUserAvatar').value = '';
    }

    deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;

        this.users = this.users.filter(u => u.id !== userId);
        this.messages = this.messages.filter(m => m.senderId !== userId && m.receiverId !== userId);
        this.groups.forEach(group => {
            group.members = group.members.filter(id => id !== userId);
            if (group.admin === userId) {
                group.admin = group.members[0] || null;
            }
        });

        this.saveData();
        this.renderUserManagement();
        this.renderContactList();
        this.showNotification('User deleted', `${user.name} has been removed from the system`, 'success');
    }

    deleteGroup(groupId) {
        const group = this.groups.find(g => g.id === groupId);
        if (!confirm(`Are you sure you want to delete the group "${group.name}"?`)) return;

        this.groups = this.groups.filter(g => g.id !== groupId);
        this.messages = this.messages.filter(m => m.groupId !== groupId);

        this.saveData();
        this.renderGroupManagement();
        this.renderContactList();
        this.showNotification('Group deleted', `Group "${group.name}" has been removed`, 'success');
    }

    saveSettings() {
        if (this.currentUser.role === 'admin') {
            const companyNameInput = document.getElementById('companyNameInput');
            if (companyNameInput) {
                this.companySettings.name = companyNameInput.value.trim();
            }
            this.saveData();
            this.updateCompanyBranding();
        }

        this.hideModal('settingsModal');
        this.showNotification('Settings saved', 'Your settings have been updated.', 'success');
    }

    handleLogoUpload(file) {
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showError('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                if (img.width < 170 || img.height < 66) {
                    this.showError('Logo must be at least 170x66 pixels.');
                    return;
                }
                
                this.companySettings.logo = e.target.result;
                this.saveData();
                this.updateCompanyBranding();
                this.showNotification('Logo updated', 'Company logo has been updated.', 'success');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    resetAllData() {
        localStorage.clear();
        location.reload();
    }

    showNewGroupModal() {
        const modal = document.getElementById('newGroupModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
        this.renderMemberSelection();
    }

    renderMemberSelection() {
        const memberList = document.getElementById('memberSelectionList');
        if (!memberList) return;
        
        memberList.innerHTML = '';

        this.users.forEach(user => {
            if (user.id === this.currentUser.id) return;

            const memberDiv = document.createElement('div');
            memberDiv.className = 'member-item';
            memberDiv.innerHTML = `
                <input type="checkbox" id="member-${user.id}" value="${user.id}">
                <span class="contact-avatar" style="font-size: 24px; width: 32px; height: 32px;">${user.avatar}</span>
                <div>
                    <div class="contact-name">${user.name}</div>
                    <div class="contact-phone">${user.phone}</div>
                </div>
            `;
            memberList.appendChild(memberDiv);
        });
    }

    createGroup() {
        const groupName = document.getElementById('groupNameInput').value.trim();
        const groupDescription = document.getElementById('groupDescriptionInput').value.trim();
        const selectedMembers = Array.from(document.querySelectorAll('#memberSelectionList input:checked'))
            .map(cb => parseInt(cb.value));

        if (!groupName) {
            this.showError('Please enter a group name.');
            return;
        }

        if (selectedMembers.length === 0) {
            this.showError('Please select at least one member.');
            return;
        }

        const group = {
            id: Date.now(),
            name: groupName,
            members: [this.currentUser.id, ...selectedMembers],
            admin: this.currentUser.id,
            avatar: '👥',
            description: groupDescription
        };

        this.groups.push(group);
        this.saveData();
        this.renderContactList();
        this.hideModal('newGroupModal');
        this.showNotification('Group created', `Group "${groupName}" has been created.`, 'success');

        // Clear form
        document.getElementById('groupNameInput').value = '';
        document.getElementById('groupDescriptionInput').value = '';
    }

    startRealTimeUpdates() {
        // Simulate real-time updates with incoming messages
        setInterval(() => {
            if (this.currentUser && Math.random() < 0.02) {
                this.simulateIncomingMessage();
            }
        }, 20000);

        // Update user statuses periodically
        setInterval(() => {
            if (this.currentUser) {
                this.updateUserStatuses();
            }
        }, 60000);
    }

    simulateIncomingMessage() {
        if (!this.currentUser || this.users.length < 2) return;

        const otherUsers = this.users.filter(u => u.id !== this.currentUser.id && u.status === 'online');
        if (otherUsers.length === 0) return;
        
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        
        const demoMessages = [
            "Hi there! 👋",
            "How's your day going?",
            "Can you check the latest report?",
            "Thanks for your help! 😊",
            "Let's sync up later today",
            "Great work on the project! 👏"
        ];

        const randomMessage = demoMessages[Math.floor(Math.random() * demoMessages.length)];
        
        const message = {
            id: Date.now() + Math.random(),
            senderId: randomUser.id,
            receiverId: this.currentUser.id,
            content: randomMessage,
            timestamp: new Date().toISOString(),
            type: 'text'
        };

        this.messages.push(message);
        this.saveData();

        // Update UI if this chat is currently open
        if (this.currentChat && this.currentChat.contact.id === randomUser.id && this.currentChat.type === 'user') {
            this.renderMessages();
        }
        
        this.renderContactList();
        this.showNotification('New Message', `${randomUser.name}: ${randomMessage}`, 'info');
    }

    updateUserStatuses() {
        // Randomly update user statuses for simulation
        this.users.forEach(user => {
            if (user.id !== this.currentUser.id) {
                const statuses = ['online', 'away', 'offline'];
                if (Math.random() < 0.1) {
                    user.status = statuses[Math.floor(Math.random() * statuses.length)];
                    user.lastSeen = new Date().toISOString();
                }
            }
        });
        this.saveData();
        this.renderContactList();
    }

    showNotification(title, message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;

        container.appendChild(notification);

        // Auto remove after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);

        // Request permission for browser notifications
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y=".9em" font-size="90">💬</text></svg>'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body: message });
                }
            });
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            
            setTimeout(() => {
                errorDiv.classList.add('hidden');
            }, 5000);
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing chat app...');
    
    // Request notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Initialize the chat app
    window.chatApp = new ChatApp();
});

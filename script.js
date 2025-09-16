document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const generatedPasswordInput = document.getElementById('generatedPassword');
    const lengthSlider = document.getElementById('length');
    const lengthValueSpan = document.getElementById('lengthValue');
    const includeUppercaseCheckbox = document.getElementById('includeUppercase');
    const includeLowercaseCheckbox = document.getElementById('includeLowercase');
    const includeNumbersCheckbox = document.getElementById('includeNumbers');
    const includeSymbolsCheckbox = document.getElementById('includeSymbols');
    const generateBtn = document.getElementById('generateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const copyBtn = document.getElementById('copyBtn');
    const copyFeedback = document.getElementById('copy-feedback');
    const searchInput = document.getElementById('searchInput');
    const savedListBody = document.getElementById('savedList');

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    lengthSlider.addEventListener('input', (e) => {
        lengthValueSpan.textContent = e.target.value;
    });

    generateBtn.addEventListener('click', generatePassword);
    copyBtn.addEventListener('click', copyToClipboard);
    saveBtn.addEventListener('click', saveCredentials);
    searchInput.addEventListener('input', filterSavedCredentials);

    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        let characterPool = '';
        let password = '';

        if (includeUppercaseCheckbox.checked) characterPool += uppercaseChars;
        if (includeLowercaseCheckbox.checked) characterPool += lowercaseChars;
        if (includeNumbersCheckbox.checked) characterPool += numberChars;
        if (includeSymbolsCheckbox.checked) characterPool += symbolChars;

        if (characterPool === '') {
            alert('Pilih setidaknya satu jenis karakter!');
            return;
        }

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characterPool.length);
            password += characterPool[randomIndex];
        }

        generatedPasswordInput.value = password;
    }

    function copyToClipboard() {
        if (generatedPasswordInput.value === '') return;
        navigator.clipboard.writeText(generatedPasswordInput.value).then(() => {
            copyFeedback.classList.remove('d-none');
            setTimeout(() => {
                copyFeedback.classList.add('d-none');
            }, 2000);
        });
    }

    function saveCredentials() {
        const username = usernameInput.value.trim();
        const password = generatedPasswordInput.value;

        if (!username || !password) {
            alert('Username dan password tidak boleh kosong!');
            return;
        }

        let credentials = getSavedCredentials();
        const existingIndex = credentials.findIndex(cred => cred.username === username);

        if (existingIndex > -1) {
            if (!confirm(`Username "${username}" sudah ada. Apakah Anda ingin menimpanya?`)) {
                return;
            }
            credentials.splice(existingIndex, 1);
        }

        credentials.push({ username, password });
        localStorage.setItem('passwords', JSON.stringify(credentials));
        usernameInput.value = '';
        generatedPasswordInput.value = '';
        renderSavedCredentials();
    }

    function getSavedCredentials() {
        return JSON.parse(localStorage.getItem('passwords')) || [];
    }

    function renderSavedCredentials(filteredData = null) {
        savedListBody.innerHTML = '';
        const credentials = filteredData || getSavedCredentials();

        if (credentials.length === 0) {
            savedListBody.innerHTML = '<tr><td colspan="3" class="text-center">Belum ada data yang tersimpan.</td></tr>';
            return;
        }

        credentials.forEach((item, index) => {
            const row = document.createElement('tr');

            const originalPassword = item.password;

            row.innerHTML = `
                <td>${escapeHTML(item.username)}</td>
                <td>
                    <div class="password-cell">
                        <span class="password-text" data-password="${escapeHTML(originalPassword)}">••••••••••</span>
                        <i class="fas fa-eye action-btn" onclick="togglePasswordVisibility(this)"></i>
                    </div>
                </td>
                <td class="action-buttons-cell">
                    <button class="btn btn-secondary btn-sm" title="Salin Password" onclick="copySavedPassword(this)">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" title="Hapus" onclick="deleteCredential('${escapeHTML(item.username)}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            savedListBody.appendChild(row);
        });
    }

    window.togglePasswordVisibility = function (element) {
        const passwordSpan = element.previousElementSibling;
        const icon = element;

        if (icon.classList.contains('fa-eye')) {
            passwordSpan.textContent = passwordSpan.dataset.password;
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            passwordSpan.textContent = '••••••••••';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    window.copySavedPassword = function (element) {
        const row = element.closest('tr');
        const passwordSpan = row.querySelector('.password-text');
        const password = passwordSpan.dataset.password;

        navigator.clipboard.writeText(password).then(() => {
            const copyIcon = element.querySelector('i');
            copyIcon.classList.remove('fa-copy');
            copyIcon.classList.add('fa-check');
            element.classList.add('btn-success');
            setTimeout(() => {
                copyIcon.classList.remove('fa-check');
                copyIcon.classList.add('fa-copy');
                element.classList.remove('btn-success');
            }, 1500);
        });
    }

    window.deleteCredential = function (username) {
        if (!confirm(`Apakah Anda yakin ingin menghapus data untuk username "${username}"?`)) {
            return;
        }
        let credentials = getSavedCredentials();
        credentials = credentials.filter(cred => cred.username !== username);
        localStorage.setItem('passwords', JSON.stringify(credentials));
        renderSavedCredentials();
    }

    function filterSavedCredentials() {
        const query = searchInput.value.toLowerCase();
        const credentials = getSavedCredentials();
        const filtered = credentials.filter(cred => cred.username.toLowerCase().includes(query));
        renderSavedCredentials(filtered);
    }

    function escapeHTML(str) {
        const p = document.createElement('p');
        p.textContent = str;
        return p.innerHTML;
    }

    renderSavedCredentials();
});
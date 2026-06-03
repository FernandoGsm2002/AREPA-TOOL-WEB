// Recovery redirect — runs immediately before DOM is needed
(function() {
    const hash = window.location.hash;
    if (hash.includes('type=recovery') && hash.includes('access_token=')) {
        window.location.replace('reset-password.html' + hash);
    }
})();

AOS.init({ duration: 800, once: true });

function playVideo(card, videoId) {
    const container = card.querySelector('.video-container');
    container.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
}

// === WhatsApp Group Modal ===
function openWaModal() {
    document.getElementById('wa-modal-overlay').classList.add('active');
    resetWaModal();
    document.getElementById('wa-email-input').focus();
    document.body.style.overflow = 'hidden';
}

function closeWaModal() {
    document.getElementById('wa-modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

function handleOverlayClick(e) {
    if (e.target === document.getElementById('wa-modal-overlay')) closeWaModal();
}

function resetWaModal() {
    document.getElementById('wa-email-input').value = '';
    showWaMsg('', '');
    document.getElementById('wa-group-link').style.display = 'none';
    document.getElementById('wa-submit-btn').disabled = false;
    if (window.turnstile) {
        window.turnstile.reset(document.getElementById('wa-turnstile'));
    }
}

function showWaMsg(text, type) {
    const el = document.getElementById('wa-msg');
    if (!text) { el.style.display = 'none'; return; }
    el.textContent = text;
    el.className = type;
    el.style.display = 'block';
}

async function submitWaCheck() {
    const email = document.getElementById('wa-email-input').value.trim();
    const btn   = document.getElementById('wa-submit-btn');

    if (!email) {
        showWaMsg('Por favor ingresa tu correo electrónico.', 'error');
        return;
    }

    let turnstileToken = null;
    if (window.turnstile) {
        turnstileToken = window.turnstile.getResponse(document.getElementById('wa-turnstile'));
    }
    if (!turnstileToken) {
        showWaMsg('Completa la verificación de seguridad primero.', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> Verificando...';
    showWaMsg('', '');

    try {
        const res = await fetch('/api/whatsapp-group', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, turnstileToken })
        });
        const data = await res.json();

        if (res.ok && data.link) {
            showWaMsg('', '');
            document.getElementById('wa-link-anchor').href = data.link;
            document.getElementById('wa-group-link').style.display = 'block';
            btn.style.display = 'none';
            document.getElementById('wa-email-input').style.display = 'none';
            document.querySelector('.cf-turnstile').style.display = 'none';
            document.querySelector('.wa-subtitle').textContent = '¡Tu correo tiene acceso! Únete al grupo oficial.';
        } else {
            showWaMsg(data.error || 'No se pudo verificar. Intenta de nuevo.', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-shield-check"></i> Verificar Acceso';
            if (window.turnstile) window.turnstile.reset(document.getElementById('wa-turnstile'));
        }
    } catch (err) {
        showWaMsg('Error de conexión. Intenta más tarde.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-shield-check"></i> Verificar Acceso';
        if (window.turnstile) window.turnstile.reset(document.getElementById('wa-turnstile'));
    }
}

// === Mobile Menu ===
function toggleMobileMenu() {
    const nav = document.getElementById('mobileNav');
    if (nav.classList.contains('open')) {
        closeMobileMenu();
    } else {
        nav.classList.add('open');
        document.getElementById('mobileToggleIcon').className = 'bi bi-x-lg';
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    document.getElementById('mobileNav').classList.remove('open');
    document.getElementById('mobileToggleIcon').className = 'bi bi-list';
    document.body.style.overflow = '';
}

window.addEventListener('scroll', () => {
    if (document.getElementById('mobileNav').classList.contains('open')) closeMobileMenu();
}, { passive: true });

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeWaModal(); closeMobileMenu(); }
});

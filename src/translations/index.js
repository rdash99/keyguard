const TRANSLATIONS = {
    en: {
        _language: 'English',
        loading: 'Loading...',
        'passphrase-strength': 'Strength',
        'passphrase-confirm': 'Confirm',
        'passphrase-placeholder': 'Enter Passphrase',
        'sign-tx-wrong-passphrase': 'Wrong Passphrase, please try again',
        'sign-tx-button-enter-pin': 'Enter PIN',
        'create-choose-identicon-header1': 'Choose Your Account Avatar',
        'create-backup-account-header': 'Backup your Account',
        'create-set-passphrase-header1': 'Set a Passphrase',
        'create-set-passphrase-header2': 'Please enter a Passphrase to secure your account.',
        'create-set-passphrase-warning': 'The Pass Phrase is [strong]not[/strong] an alternative for your 24 Recovery '
                                       + 'Words!',
        'create-confirm-passphrase': 'Please repeat your Passphrase:',
        'create-choose-pin': 'Choose your PIN',
        'create-enter-account-control-pin': 'Please enter an account control PIN',
        'create-pin-warning': 'Careful, this PIN is [strong]not recoverable![/strong] If you lose it, you lose access '
                            + 'to your funds.',
        'create-confirm-pin': 'Please repeat PIN to confirm',
        'create-pin-not-matching': 'PIN not matching. Please try again.',
        'recovery-words-title': 'Recovery Words',
    },
    de: {
        _language: 'Deutsch',
        loading: 'Wird geladen...',
        'passphrase-strength': 'Stärke',
        'passphrase-confirm': 'Bestätigen',
        'passphrase-placeholder': 'Passphrase eingeben',
        'sign-tx-wrong-passphrase': 'Falsche Passphrase, bitte versuche es nochmal',
        'sign-tx-button-enter-pin': 'PIN eingeben',
        'create-choose-identicon-header1': 'Wähle einen Avatar für dein Konto',
        'create-set-passphrase-header1': 'Lege eine Passphrase fest',
        'create-set-passphrase-header2': 'Bitte gib eine Passphrase ein, um dein Konto zu sichern.',
        'create-set-passphrase-warning': `Die Passphrase ist [strong]keine[/strong] Alternative für deine 24
            Wiederherstellungswörter!`,
        'create-confirm-passphrase': 'Bitte Passphrase wiederholen:',
        'create-choose-pin': 'PIN wählen',
        'create-enter-account-control-pin': 'Bitte gib eine PIN für dein Konto ein',
        'create-pin-warning': 'Vorsicht, die PIN ist [strong]nicht wiederherstellbar![/strong] Falls sie sie '
                            + 'verlieren, verlieren sie auch den Zugang zu ihrem Guthaben!',
        'create-confirm-pin': 'Zur Bestätigung, bitte PIN wiederholen',
        'create-pin-not-matching': 'PIN stimmt nicht überein. Bitte noch einmal versuchen.',
        'recovery-words-title': 'Wiederherstellungswörter',
    },
};

if (typeof module !== 'undefined') module.exports = TRANSLATIONS;
else window.TRANSLATIONS = TRANSLATIONS;

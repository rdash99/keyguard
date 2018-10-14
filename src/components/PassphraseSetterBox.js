/* global Nimiq */
/* global I18n */
/* global PassphraseInput */

class PassphraseSetterBox extends Nimiq.Observable {
    /**
     * @param {?HTMLFormElement} $el
     * @param {object} [options]
     */
    constructor($el, options = {}) {
        const defaults = {
            bgColor: 'purple',
        };

        super();

        this._password = '';

        /** @type {object} */
        this.options = Object.assign(defaults, options);

        this.$el = PassphraseSetterBox._createElement($el, this.options);

        this._passphraseInput = new PassphraseInput(this.$el.querySelector('[passphrase-input]'));
        this._passphraseInput.on(PassphraseInput.Events.VALID, isValid => this._onInputChangeValidity(isValid));

        this.$el.addEventListener('submit', event => this._onSubmit(event));

        /** @type {HTMLElement} */
        (this.$el.querySelector('.password-skip')).addEventListener('click', () => this._onSkip());
    }

    /**
     * @param {?HTMLFormElement} [$el]
     * @param {object} options
     * @returns {HTMLFormElement}
     */
    static _createElement($el, options) {
        $el = $el || document.createElement('form');
        $el.classList.add('passphrase-box', 'actionbox', 'setter', 'center', options.bgColor);

        /* eslint-disable max-len */
        $el.innerHTML = `
            <h2 class="prompt protect" data-i18n="passphrasebox-protect-keyfile">Protect your keyfile with a password</h2>
            <h2 class="prompt repeat" data-i18n="passphrasebox-repeat-password">Repeat your password</h2>

            <div passphrase-input></div>

            <div class="password-strength strength-8"  data-i18n="passphrasebox-password-strength-8" >Great, that's a good password!</div>
            <div class="password-strength strength-10" data-i18n="passphrasebox-password-strength-10">Super, that's a strong password!</div>
            <div class="password-strength strength-12" data-i18n="passphrasebox-password-strength-12">Excellent, that's a very strong password!</div>

            <div class="password-hint" data-i18n="passphrasebox-password-hint">Your password should have at least 8 characters.</div>
            <a tabindex="0" class="password-skip" data-i18n="passphrasebox-password-skip">Skip password protection for now</a>

            <button class="submit" data-i18n="passphrasebox-continue">Continue</button>
        `;
        /* eslint-enable max-len */

        I18n.translateDom($el);
        return $el;
    }

    /** @returns {HTMLElement} @deprecated */
    getElement() {
        return this.$el;
    }

    /** @type {HTMLElement} */
    get element() {
        return this.$el;
    }

    focus() {
        this._passphraseInput.focus();
    }

    /**
     * @param {boolean} [isWrongPassphrase]
     */
    async reset(isWrongPassphrase) {
        this._password = '';

        if (isWrongPassphrase) await this._passphraseInput.onPassphraseIncorrect();
        else this._passphraseInput.reset();

        this.$el.classList.remove('repeat');
    }

    /**
     * @param {boolean} isValid
     */
    _onInputChangeValidity(isValid) {
        this.$el.classList.toggle('input-valid', isValid);

        const length = this._passphraseInput.text.length;
        this.$el.classList.toggle('strength-8', length < 10);
        this.$el.classList.toggle('strength-10', length >= 10 && length < 12);
        this.$el.classList.toggle('strength-12', length >= 12);
    }

    /**
     * @param {Event} event
     */
    _onSubmit(event) {
        event.preventDefault();

        if (!this._password) {
            this._password = this._passphraseInput.text;
            this._passphraseInput.reset();
            this.$el.classList.add('repeat');
        } else if (this._password !== this._passphraseInput.text) {
            this.reset(true);
        } else {
            this.fire(PassphraseSetterBox.Events.SUBMIT, this._password);
            this.reset();
        }
    }

    _onSkip() {
        this.fire(PassphraseSetterBox.Events.SKIP);
    }
}

PassphraseSetterBox.Events = {
    SUBMIT: 'passphrasebox-submit',
    SKIP: 'passphrasebox-skip',
};
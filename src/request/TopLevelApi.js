/* global BrowserDetection */
/* global Constants */
/* global Errors */
/* global KeyStore */
/* global CookieJar */
/* global I18n */
/* global Nimiq */
/* global RequestParser */
/* global NoRequestErrorPage */

/**
 * A common parent class for pop-up requests.
 *
 * Usage:
 * Inherit this class in your popup request API class and define two properties:
 * ```
 *  class SignTransactionApi extends TopLevelApi {
 *      async parseRequest(request) {
 *          // This method receives the raw internal request and is expected to
 *          // return a parsed request of the same type, using the parsing methods
 *          // inherited from the RequestParser class.
 *          // Throwing an InvalidRequestError means parsing has failed.
 *      }
 *
 *      get Handler() {
 *          // Should return the class that should be instantiated as the request's primary handler
 *      }
 *
 *      async onBeforeRun(parsedRequest) {
 *          // This optional method receives the parsed request just before the
 *          // global close button text is set and the handler is run.
 *          // The return value is not used.
 *      }
 *
 *      async onGlobalClose(handler) {
 *          // Handle the user's click on the global-close button.
 *          // This method receives the instantiated handler.
 *      }
 *  }
 *
 *  // Finally, start your API:
 *  runKeyguard(SignTransactionApi);
 * ```
 * @abstract
 * @template {KeyguardRequest.RedirectRequest} T
 */
class TopLevelApi extends RequestParser {
    constructor() {
        super();
        if (window.self !== window.top) {
            // TopLevelApi may not run in a frame
            throw new Error('Illegal use');
        }

        /** @type {Function} */
        this._resolve = () => { throw new Error('Method this._resolve not defined'); };

        /** @type {Function} */
        this._reject = () => { throw new Error('Method this._reject not defined'); };

        /** @type {any?} */
        this._handler = null;

        I18n.initialize(window.TRANSLATIONS, 'en');
        I18n.translateDom();
    }

    /**
     * Method to be called by the Keyguard client via RPC
     *
     * @param {RpcState?} state
     * @param {unknown} request
     */
    async request(state, request) {
        /**
         * Detect migration cookie set by the iframe
         *
         * @deprecated Only for database migration
         */
        if (BrowserDetection.isIOS() || BrowserDetection.isSafari()) {
            if (TopLevelApi._hasMigrateFlag()) {
                await KeyStore.instance.migrateAccountsToKeys();
            }
            /*
             * There is a case using recovery words when the kind of secret, entropy or privateKey is ambiguous.
             * In that scenario both keys will be encrypted and stored.
             * After returning, the Hub will do an activity lookup for addresses to both of these keys.
             * In case one did not see any activity at all, it will be discarded and removed by this code.
             * The cookie is set in `IFrameAPI.releaseKey()` which requires the session to still be active.
             */
            if (TopLevelApi._hasRemoveKey()) {
                // eat
                const match = document.cookie.match(new RegExp('removeKey=([^;]+)'));
                if (match && match[1]) {
                    try {
                        /** @type {string[]} */
                        const removeKeyArray = JSON.parse(match[1]);
                        await Promise.all(removeKeyArray.map(keyId => KeyStore.instance.remove(keyId)));
                    } catch (e) {
                        this._reject(e);
                    }
                }
                // crumble
                CookieJar.deleteCookie('removeKey');
            }
        }

        const parsedRequest = await this.parseRequest(request);

        return new Promise(async (resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;

            if (!parsedRequest) { // should already be rejected here with an Errors.InvalidRequestError()
                // this really should never happen
                this.reject(new Errors.InvalidRequestError('Request could not be parsed'));
                return;
            }

            /**
             * Load the crypto worker only if needed. That is, requests who are either
             * Import or Create (the only ones which don't have the keyInfo property)
             * or any request which has the keyInfo property and the encrypted flag set.
             */
            if (!(/** @type {any} */(parsedRequest).keyInfo)
                || /** @type {any} */(parsedRequest).keyInfo.encrypted) {
                Nimiq.CryptoWorker.getInstanceAsync();
            }

            window.addEventListener('unhandledrejection', event => {
                const error = new Errors.UnclassifiedError(/** @type {PromiseRejectionEvent} */(event).reason);
                this.reject(error);
                return false;
            });

            window.addEventListener('error', event => {
                let error;
                if (event.error) {
                    error = new Errors.UnclassifiedError(event.error);
                } else {
                    error = new Errors.UnclassifiedError(
                        `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`,
                    );
                }
                this.reject(error);
                return false;
            });

            if (!this.Handler) {
                reject(new Errors.KeyguardError('Handler undefined'));
                return;
            }

            try {
                this._handler = new this.Handler(parsedRequest, this.resolve.bind(this), reject);

                await this.onBeforeRun(parsedRequest);

                this.setGlobalCloseButtonText(`${I18n.translatePhrase('back-to')} ${parsedRequest.appName}`);

                this._handler.run();

                TopLevelApi.setLoading(false);

                TopLevelApi.focusPasswordBox();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Overwritten by each request's API class
     *
     * @param {unknown} request
     * @returns {Promise<Parsed<T>>}
     * @abstract
     */
    async parseRequest(request) { // eslint-disable-line no-unused-vars
        throw new Error('parseRequest not implemented');
    }

    /** @type {Newable?} */
    get Handler() {
        return null;
    }

    /**
     * Can be overwritten by a request's API class to excute code before the handler's run() is called
     * @param {Parsed<T>} parsedRequest
     */
    async onBeforeRun(parsedRequest) { // eslint-disable-line no-unused-vars
        // noop
    }

    /**
     * Can be overwritten by a request's API class to excute custom code when the user clicks
     * the global-cancel button.
     * The instantiated handler is passed as the only argument.
     * @param {any} handler
     */
    async onGlobalClose(handler) { // eslint-disable-line no-unused-vars
        this.reject(new Errors.RequestCanceled());
    }

    /**
     * Called by a page's API class on success
     *
     * @param {KeyguardRequest.ResultType<T>} result
     * @returns {Promise<void>}
     */
    async resolve(result) {
        // Keys might have changed, so update cookie for iOS and Safari users
        if (BrowserDetection.isIOS() || BrowserDetection.isSafari()) {
            const keys = await KeyStore.instance.list();
            CookieJar.fill(keys);
        }

        this._resolve(result);
    }

    /**
     * Called by a page's API class on error
     *
     * @param {Error} error
     */
    reject(error) {
        this._reject(error);
    }

    /**
     * @param {string} buttonText
     */
    setGlobalCloseButtonText(buttonText) {
        /** @type {HTMLElement} */
        const $globalCloseText = (document.querySelector('#global-close-text'));
        /** @type {HTMLSpanElement} */
        const $button = ($globalCloseText.parentNode);
        if (!$button.classList.contains('display-none')) return;
        $globalCloseText.textContent = buttonText;
        $button.addEventListener('click', () => this.onGlobalClose(this._handler));
        $button.classList.remove('display-none');
    }

    /**
     * @param {boolean} showLoading
     */
    static setLoading(showLoading) {
        // Check if a loading spinner element is available somewhere on the current page
        const loadingSpinner = document.body.querySelector('.page:target .loading-spinner');
        if (loadingSpinner) {
            /** @type {HTMLElement} */
            (document.getElementById(TopLevelApi.Pages.LOADING)).classList.add('display-none');
        } else {
            /** @type {HTMLElement} */
            (document.getElementById(TopLevelApi.Pages.LOADING)).classList.remove('display-none');
        }
        document.body.classList.toggle('loading', showLoading);
    }

    static showNoRequestErrorPage() {
        const errorPage = new NoRequestErrorPage();
        /** @type {HTMLDivElement} */
        const $target = (document.querySelector('#rotation-container') || document.querySelector('#app'));
        $target.appendChild(errorPage.getElement());
        window.location.hash = 'error';
        TopLevelApi.setLoading(false);
    }

    static focusPasswordBox() {
        if (TopLevelApi.getDocumentWidth() > Constants.MIN_WIDTH_FOR_AUTOFOCUS) {
            const $passwordBoxInput = (document.querySelector('.page:target .password-box input'));
            if ($passwordBoxInput) {
                /** @type {HTMLInputElement} */
                ($passwordBoxInput).focus();
            }
        }
    }

    /**
     * @deprecated Only for database migration
     * @returns {boolean}
     * @private
     */
    static _hasMigrateFlag() {
        const match = document.cookie.match(new RegExp('migrate=([^;]+)'));
        return !!match && match[1] === '1';
    }

    /**
     * @returns {boolean}
     * @private
     */
    static _hasRemoveKey() {
        const match = document.cookie.match(new RegExp('removeKey=([^;]+)'));
        return !!match && match[1] !== '';
    }

    /**
     * @returns {number} the current width of the document
     */
    static getDocumentWidth() {
        return window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
    }
}

TopLevelApi.Pages = {
    LOADING: 'loading',
};

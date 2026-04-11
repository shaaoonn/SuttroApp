package com.suttro.app

import android.webkit.JavascriptInterface

/**
 * JavaScript interface bridge for WebView <-> Native communication.
 * Accessible from JS as `window.SuttroBridge`.
 */
class SuttroBridge(
    private val sessionManager: SessionManager,
    private val onPageChanged: (String) -> Unit,
    private val onLogout: () -> Unit,
    private val onReady: () -> Unit,
    private val onTitleUpdate: ((String) -> Unit)? = null,
    private val onBadgeUpdate: ((Int) -> Unit)? = null
) {
    @JavascriptInterface
    fun getSession(): String {
        return sessionManager.getSessionJson() ?: ""
    }

    @JavascriptInterface
    fun onPageChanged(path: String) {
        onPageChanged.invoke(path)
    }

    @JavascriptInterface
    fun logout() {
        sessionManager.clearSession()
        onLogout.invoke()
    }

    @JavascriptInterface
    fun onReady() {
        onReady.invoke()
    }

    @JavascriptInterface
    fun isNativeApp(): Boolean = true

    /** Web calls this to set dynamic page title */
    @JavascriptInterface
    fun updateTitle(title: String) {
        onTitleUpdate?.invoke(title)
    }

    /** Web calls this with unread notification count */
    @JavascriptInterface
    fun updateBadge(count: Int) {
        onBadgeUpdate?.invoke(count)
    }

    companion object {
        const val INTERFACE_NAME = "SuttroBridge"
    }
}

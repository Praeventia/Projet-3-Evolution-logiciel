package com.client_leger.colorimage.Chat.presentation.channels.components

import android.content.Context
import android.util.AttributeSet
import android.view.KeyEvent
import android.widget.AutoCompleteTextView

class AutoCompleteChannelView: androidx.appcompat.widget.AppCompatAutoCompleteTextView {
    constructor(context: Context) : super(context)
    constructor(context: Context, attrs: AttributeSet) : super(context, attrs)
    constructor(context: Context, attrs: AttributeSet, defStyleAttr: Int) : super(context, attrs, defStyleAttr)

    override fun onKeyPreIme(keyCode: Int, event: KeyEvent): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && event.action == KeyEvent.ACTION_UP) {
            return false
        } else if (keyCode == KeyEvent.KEYCODE_BACK && event.action == KeyEvent.ACTION_DOWN) {
            text.insert(0, " ")
            clearFocus()
            return false
        } else if (keyCode == KeyEvent.KEYCODE_DEL) {
            return false
        }
        return super.onKeyPreIme(keyCode, event)
    }
}

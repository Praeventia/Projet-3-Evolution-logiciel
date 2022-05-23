package com.client_leger.colorimage.drawing

import android.text.Editable
import android.text.SpannableStringBuilder
import android.view.View
import android.view.inputmethod.BaseInputConnection
import com.client_leger.colorimage.drawing.canvas_view.CanvasView


class CustomInputConnection(targetView: View?,
                            fullEditor: Boolean
) : BaseInputConnection(targetView, fullEditor) {

    private var mEditable: SpannableStringBuilder? = null
    private var customView : CanvasView = targetView as CanvasView

    init{
        mEditable = customView.text
    }

    override fun getEditable(): Editable? {
        return mEditable
    }

    // just adding this to show that text is being committed.
    override fun commitText(text: CharSequence?, newCursorPosition: Int): Boolean {
        mEditable?.append(text)
        customView.setText(text)
        return true
    }
}

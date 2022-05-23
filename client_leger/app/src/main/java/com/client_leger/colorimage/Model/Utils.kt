package com.client_leger.colorimage.Model

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import com.client_leger.colorimage.Constants.Constants

object Utils {

    fun startNewActivity(context: Context, clazz: Class<*>) {
        val intent = Intent(context, clazz)
        // start your next activity
        context.startActivity(intent)
    }

}

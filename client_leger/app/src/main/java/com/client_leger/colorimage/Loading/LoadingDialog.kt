package com.client_leger.colorimage.Loading

import android.app.Activity
import android.app.AlertDialog
import com.client_leger.colorimage.R

class LoadingDialog(private val mActivity: Activity) {

    private lateinit var mDialog: AlertDialog

    fun startLoadingDialog(){
        val inflater = mActivity.layoutInflater
        val builder = AlertDialog.Builder(mActivity)
        builder.setView(inflater.inflate(R.layout.loading_dialog, null))
        builder.setCancelable(false)
        mDialog = builder.create()
        mDialog.show()
    }

    fun dismissDialog(){
        mDialog.dismiss()
    }

}



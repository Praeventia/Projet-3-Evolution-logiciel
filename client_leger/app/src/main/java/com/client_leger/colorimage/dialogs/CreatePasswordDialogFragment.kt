package com.client_leger.colorimage.dialogs

import android.app.AlertDialog
import android.app.Dialog
import android.content.DialogInterface
import android.content.Intent
import android.os.Bundle
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.*
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.coroutineScope
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.R
import com.client_leger.colorimage.album.data.intermediate.IntermediateDrawingInAlbumServer
import com.client_leger.colorimage.drawing.DrawingActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class CreatePasswordDialogFragment (private val drawingID: String) : DialogFragment() {

    private lateinit var password: EditText

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {

        return activity?.let {

            val builder = AlertDialog.Builder(it)
            val inflater = requireActivity().layoutInflater
            val view = inflater.inflate(R.layout.dialog_ask_password, null)
            password = view.findViewById(R.id.passwordDrawing)

            builder.setView(view)
                .setPositiveButton(R.string.confirm) { _, _ ->
                    {}
                }
                .setNegativeButton(R.string.cancel) { _, _ ->
                    dialog?.cancel()
                }

            builder.create()
        } ?: throw IllegalStateException("Activity cannot be null")
    }

    override fun onResume() {
        super.onResume()
        val dialog = dialog as AlertDialog
        val positiveButton = dialog.getButton(Dialog.BUTTON_POSITIVE) as Button
        positiveButton.setOnClickListener {
            val wantToCloseDialog = checkInformationIsCorrect()
            if (wantToCloseDialog){
                sendDrawingInfos(dialog)
            }
        }
    }

    private fun checkInformationIsCorrect() : Boolean{
        val shake: Animation = AnimationUtils.loadAnimation(context, R.anim.vibrate)

        val filtrated = password.text.replace("[\\t\\n\\r ]+".toRegex(), "")
        if (filtrated.isEmpty()) {
            password.startAnimation(shake)
            Toast.makeText(activity, "Le mot de passe ne doit pas être vide", Toast.LENGTH_LONG).show()
            return false
        }

        return true
    }

    private fun sendDrawingInfos(dialog: AlertDialog) {
        lifecycle.coroutineScope.launch(context = Dispatchers.Main) {
            val result = IntermediateDrawingInAlbumServer.verifyPassword(drawingID, password.text.toString())
            if (!result.getOrDefault(false)){
                val shake: Animation = AnimationUtils.loadAnimation(context, R.anim.vibrate)
                password.startAnimation(shake)
                Toast.makeText(activity, "Information invalide", Toast.LENGTH_LONG).show()
            }
            else{
                dialog.dismiss()
                changeToEditor()
            }
        }

    }

    private fun changeToEditor(){
        activity.let {
            val intent = Intent(it, DrawingActivity::class.java)
            intent.putExtra("drawingID", drawingID)
            intent.putExtra("password", password.text.toString())
            startActivity(intent)
        }
    }
}

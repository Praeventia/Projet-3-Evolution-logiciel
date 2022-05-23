package com.client_leger.colorimage.dialogs

import android.app.AlertDialog
import android.app.Dialog
import android.content.DialogInterface
import android.os.Bundle
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.coroutineScope
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.R
import com.client_leger.colorimage.album.adapter.AlbumUserAdapter
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.album.view_model.AlbumsViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class CreateAlbumModificationDialogFragment(private val albumId : String,
                                            private val albumName : String,
                                            private val albumDescription : String,
                                            private val position: Int,
                                            private val albumUserAdapter : AlbumUserAdapter) : DialogFragment()
{
    private lateinit var albumNameEditText: EditText
    private lateinit var albumDescriptionEditText: EditText

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        return activity?.let {
            val builder = AlertDialog.Builder(it)
            val inflater = requireActivity().layoutInflater
            val view = inflater.inflate(R.layout.dialog_modify_album, null)

            albumNameEditText = view.findViewById(R.id.albumName)
            albumDescriptionEditText = view.findViewById(R.id.album_description)

            albumNameEditText.setText(albumName)
            albumDescriptionEditText.setText(albumDescription)

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
                sendAlbumInfos(dialog)
            }
        }
    }

    private fun checkInformationIsCorrect() : Boolean{
        val shake: Animation = AnimationUtils.loadAnimation(context, R.anim.vibrate)

        var filtrated= albumNameEditText.text.replace("[\\t\\n\\r ]+".toRegex(), "")
        if (filtrated.isEmpty()) {
            albumNameEditText.startAnimation(shake)
            Toast.makeText(activity, "Le nom de l'album est invalide", Toast.LENGTH_LONG).show()
            return false
        }
        else if (albumNameEditText.text.length > 15){
            albumNameEditText.startAnimation(shake)
            Toast.makeText(activity, "Le nom de l'album doit être plus petit ou égale à 15 caractères", Toast.LENGTH_LONG).show()
            return false
        }

        filtrated = albumDescriptionEditText.text.replace("[\\t\\n\\r ]+".toRegex(), "")
        if (filtrated.isEmpty()) {
            albumDescriptionEditText.startAnimation(shake)
            Toast.makeText(activity, "La description de l'album est invalide", Toast.LENGTH_LONG).show()
            return false
        }
        else if (albumDescriptionEditText.text.length > 200){
            albumDescriptionEditText.startAnimation(shake)
            Toast.makeText(activity, "La description de l'album doit être plus petit ou égale à 200 caractères", Toast.LENGTH_LONG).show()
            return false
        }

        return true
    }

    private fun sendAlbumInfos(dialog : AlertDialog){
        if (albumNameEditText.text.toString() != albumName && albumDescriptionEditText.text.toString() != albumDescription){
            lifecycle.coroutineScope.launch(context = Dispatchers.Main) {
                val resultNameChange = IntermediateAlbumServer.changeAlbumName(albumId, albumNameEditText.text.toString())
                val resultDescriptionChange = IntermediateAlbumServer.changeAlbumDescription(albumId, albumDescriptionEditText.text.toString())
                if (resultNameChange.isFailure || resultDescriptionChange.isFailure){
                    if (resultNameChange.exceptionOrNull()?.message.toString() == "Conflict") {
                        val shake: Animation = AnimationUtils.loadAnimation(context, R.anim.vibrate)
                        albumNameEditText.startAnimation(shake)
                        Toast.makeText(activity, "Un album ne peut pas avoir le même nom qu'un autre", Toast.LENGTH_LONG).show()
                    }
                    else
                        CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(parentFragmentManager, "Error")
                }
                else{
                    albumUserAdapter.currentList[position].albumName = albumNameEditText.text.toString()
                    albumUserAdapter.currentList[position].description = albumDescriptionEditText.text.toString()
                    albumUserAdapter.notifyItemChanged(position)
                    dialog.dismiss()
                }
            }
        }
        else if(albumNameEditText.text.toString() != albumName){
            lifecycle.coroutineScope.launch(context = Dispatchers.Main) {
                val resultNameChange = IntermediateAlbumServer.changeAlbumName(albumId, albumNameEditText.text.toString())
                if (resultNameChange.isFailure){
                    if (resultNameChange.exceptionOrNull()?.message.toString() == "Conflict") {
                        val shake: Animation = AnimationUtils.loadAnimation(context, R.anim.vibrate)
                        albumNameEditText.startAnimation(shake)
                        Toast.makeText(activity, "Un album ne peut pas avoir le même nom qu'un autre", Toast.LENGTH_LONG).show()
                    }
                    else
                        CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(parentFragmentManager, "Error")
                }
                else{
                    albumUserAdapter.currentList[position].albumName = albumNameEditText.text.toString()
                    albumUserAdapter.notifyItemChanged(position)
                    dialog.dismiss()
                }
            }
        }
        else if(albumDescriptionEditText.text.toString() != albumDescription){
            lifecycle.coroutineScope.launch(context = Dispatchers.Main) {
                val resultDescriptionChange = IntermediateAlbumServer.changeAlbumDescription(albumId, albumDescriptionEditText.text.toString())
                if (resultDescriptionChange.isFailure){
                    CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(parentFragmentManager, "Error")
                }
                else{
                    albumUserAdapter.currentList[position].description = albumDescriptionEditText.text.toString()
                    albumUserAdapter.notifyItemChanged(position)
                    dialog.dismiss()
                }
            }
        }
    }

}

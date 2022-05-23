package com.client_leger.colorimage.dialogs

import android.app.AlertDialog
import android.app.Dialog
import android.content.Intent
import android.os.Bundle
import android.view.ContextThemeWrapper
import android.view.View
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.*
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.coroutineScope
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.R
import com.client_leger.colorimage.album.DrawingInAlbumFragment
import com.client_leger.colorimage.album.data.DrawingData
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.album.data.intermediate.IntermediateDrawingInAlbumServer
import com.client_leger.colorimage.drawing.DrawingActivity
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch


class CreateDrawingDialogFragment(private val albumName : String = "", private val fragment: DrawingInAlbumFragment?) : DialogFragment() {

    private var isPasswordVisible : Boolean = false
    private var spinnerItemSelected : Int = 0

    private var albumNameList: MutableList<String> = arrayListOf()
    private var albumIDList: MutableList<String> = arrayListOf()

    private lateinit var spinnerAdapter: ArrayAdapter<String>
    private lateinit var name: TextInputEditText
    private lateinit var spinner : Spinner
    private lateinit var checkBox : CheckBox
    private lateinit var password : TextInputEditText
    private lateinit var passwordWrapper : TextInputLayout

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        albumIDList.clear()
        albumNameList.clear()

        albumNameList.add("")
        albumIDList.add("")

        return activity?.let {
            askAlbumsData(it.lifecycle)
            val builder = AlertDialog.Builder(it)
            val inflater = requireActivity().layoutInflater
            val view = inflater.inflate(R.layout.dialog_create_drawing, null)
            name = view.findViewById(R.id.drawingName)
            spinner = view.findViewById(R.id.spinner)
            checkBox = view.findViewById(R.id.checkPasswordDrawing)
            password = view.findViewById(R.id.passwordDrawing)
            passwordWrapper = view.findViewById(R.id.password_drawing_wrapper)

            spinnerAdapter = ArrayAdapter<String>(activity?.applicationContext!!, android.R.layout.simple_spinner_item, albumNameList)
            spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            spinner.adapter = spinnerAdapter

            spinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener{
                override fun onNothingSelected(parent: AdapterView<*>?) {

                }
                override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                    spinnerItemSelected = position
                    if(albumNameList[position] == "Public")
                        checkBox.visibility = View.VISIBLE
                    else
                        checkBox.visibility = View.GONE
                }
            }

            checkBox.setOnCheckedChangeListener{
                    _, isChecked ->
                if (isChecked){
                    passwordWrapper.visibility = View.VISIBLE
                    isPasswordVisible = true
                }
                else{
                    passwordWrapper.visibility = View.GONE
                    isPasswordVisible = false
                }
            }

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

        var filteredtext= name.text?.replace("[\\t\\n\\r ]+".toRegex(), "")
        if (filteredtext!!.isEmpty()) {
            name.startAnimation(shake)
            Toast.makeText(activity, "Le nom du dessin est invalide", Toast.LENGTH_LONG).show()
            return false
        }
        if (name.text!!.length > 15){
            name.startAnimation(shake)
            Toast.makeText(activity, "Le nom du dessin doit être plus petit ou égale à 15 caractères", Toast.LENGTH_LONG).show()
            return false
        }

        if(isPasswordVisible)
        {
            filteredtext= password.text!!.replace("[\\t\\n\\r ]+".toRegex(), "")
            if (filteredtext.isEmpty()) {
                password.startAnimation(shake)
                Toast.makeText(activity, "Le mot de passe ne doit pas être vide", Toast.LENGTH_LONG).show()
                return false
            }
        }

        if (spinnerItemSelected == 0){
            spinner.startAnimation(shake)
            Toast.makeText(activity, "Veuillez choisir un album", Toast.LENGTH_LONG).show()
            return false
        }

        return true
    }

    private fun askAlbumsData(lifecycle: Lifecycle){
        lifecycle.coroutineScope.launch {
            val albumsData = IntermediateAlbumServer.getAllAlbumsJoinData()
            if (albumsData != null) {
                albumsData.forEach {
                    albumNameList.add(it.albumName)
                    albumIDList.add(it.albumId)
                }

                if(albumName != ""){
                    val spinnerPosition = spinnerAdapter.getPosition(albumName)
                    spinner.setSelection(spinnerPosition)
                }
            }
            else{
                dialog?.cancel()
                CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(parentFragmentManager, "Error")
                this.cancel()
            }
        }
    }

    private fun sendDrawingInfos(dialog: AlertDialog) {
        lifecycle.coroutineScope.launch(context = Dispatchers.Main) {
            val result : Result<String> = if(isPasswordVisible)
                IntermediateDrawingInAlbumServer.createDrawing(name.text.toString(),
                    albumIDList[spinnerItemSelected],
                    password.text.toString())
            else
                IntermediateDrawingInAlbumServer.createDrawing(name.text.toString(),
                    albumIDList[spinnerItemSelected])

            if (result.isFailure){
                if (result.exceptionOrNull()?.message.toString() == "Conflict") {
                    val shake: Animation = AnimationUtils.loadAnimation(context, R.anim.vibrate)
                    name.startAnimation(shake)
                    Toast.makeText(activity, "Un dessin ne peut pas avoir le même nom qu'un autre", Toast.LENGTH_LONG).show()
                }
                else
                    CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE + result.exceptionOrNull()?.message.toString()).show(parentFragmentManager, "Error")
            }
            else{
                dialog.dismiss()
                val drawingID = result.getOrNull()
                if (albumName != "" && albumName == albumNameList[spinnerItemSelected]){
                    val list = fragment!!.adapter.currentList.toMutableList()
                    list.add(DrawingData(name.text.toString(), drawingID!!, User.getUsername(), true, "", "0", albumIDList[spinnerItemSelected], isPasswordVisible))
                    fragment.adapter.submitList(list)
                    fragment.binding.isEmpty = list.isEmpty()
                    fragment.restartRefresh()
                }
                else if (albumName == ""){
                    changeToEditor(drawingID)
                }
            }
        }

    }

    private fun changeToEditor(drawingID : String?){
        activity.let {
            val intent = Intent(it, DrawingActivity::class.java)
            intent.putExtra("drawingID", drawingID)
            startActivity(intent)
        }
    }

}

package com.client_leger.colorimage.Connection


import android.content.Context
import android.graphics.Color
import android.os.Bundle
import android.view.KeyEvent
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.client_leger.colorimage.Api.Connexion.ConnexionHttpRequest
import com.client_leger.colorimage.Api.Users.UsersHttpRequest
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Regex.Regex
import com.client_leger.colorimage.Constants.Constants.EMAIL_FIELD_EMPTY
import com.client_leger.colorimage.Constants.Constants.USER_FIELD_EMPTY
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.FragmentSignupBinding
import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Avatar.Avatar
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Chat.data.data_source.MessageServer
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.Model.User
import com.squareup.picasso.MemoryPolicy
import com.squareup.picasso.NetworkPolicy
import com.squareup.picasso.Picasso
import org.json.JSONObject
import kotlinx.coroutines.*

class SignUpFragment : Fragment() {

    private var _binding: FragmentSignupBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentSignupBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val loading = LoadingDialog(requireActivity())

        if(SignUpTempVariable.getImageBitmap() != null && SignUpTempVariable.getImageSetOnce()){
            binding.avatarImage.setImageBitmap(SignUpTempVariable.getImageBitmap())
        }
        else if(SignUpTempVariable.getTempDefaultImage() != null && SignUpTempVariable.getImageSetOnce()){
            Picasso.get()
                .load(Constants.DEFAULT_AVATAR_URL + SignUpTempVariable.getTempDefaultImage())
                .memoryPolicy(MemoryPolicy.NO_CACHE)
                .networkPolicy(NetworkPolicy.NO_CACHE)
                .into(binding.avatarImage)
        }
        else{
            lifecycleScope.launch{
                setRandomDefaultAvatar()
                SignUpTempVariable.setImageSetOnce(true)
            }
        }

        setEditText()

        binding.submitForm.setOnClickListener {
            context?.let { it1 -> hideKeyboard(it1, view) }
            viewLifecycleOwner.lifecycleScope.launch {
                loading.startLoadingDialog()
                createProfileRequest()
                loading.dismissDialog()
            }
        }

        binding.avatarImage.setOnClickListener {
            val username = binding.inputUsername.text.toString()
            val email = binding.inputEmail.text.toString()
            val password = binding.inputPassword.text.toString()
            SignUpTempVariable.saveUserInfo(username,email,password )
            findNavController().navigate(R.id.action_SignUpFragment_to_AvatarGalleryFragment)
        }

        binding.submitForm.setOnKeyListener(View.OnKeyListener{ _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP){
                viewLifecycleOwner.lifecycleScope.launch {
                    createProfileRequest()
                }
                return@OnKeyListener true
            }
            false
        })

        binding.home.setOnClickListener {
            clearInput()
            findNavController().navigate(R.id.action_SignUpFragment_to_MainFragment)
        }

        binding.login.setOnClickListener {
            findNavController().navigate(R.id.action_SignUpFragment_to_LoginFragment)
        }

    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private suspend fun createProfileRequest() {
        val username = binding.inputUsername.text.toString()
        val email = binding.inputEmail.text.toString()
        val password = binding.inputPassword.text.toString()
        if(Regex.checkEmptyField(username)){
            binding.errorMessage.text = USER_FIELD_EMPTY
            return
        }
        if(Regex.checkEmptyField(email)){
            binding.errorMessage.text = EMAIL_FIELD_EMPTY
            return
        }

        val (_, response, _) = ConnexionHttpRequest.signUp(username, email, password)

        if(response.statusCode.toString() != Constants.SINGIN_SUCCES_STATUS) {
            val dataResponse = JSONObject(response.data.toString(Charsets.UTF_8))
            binding.errorMessage.text = dataResponse.getString("message").toString()
        }
        else{
            binding.errorMessage.setTextColor(Color.parseColor("#FF66fe84"))
            binding.errorMessage.text = Constants.SIGNIN_REDIRECT_SUCCES_MESSAGE
            clearInput()
            if(loginRequest(email, password) && setUser() && setAvatar()){
                Toast.makeText(activity, Constants.SIGNIN_SUCCES_MESSAGE , Toast.LENGTH_LONG ).show()
                findNavController().navigate(R.id.action_SignUpFragment_to_MainFragment)
            }
            else{
                binding.errorMessage.setTextColor(Color.parseColor("#fffd5f62"))
                binding.errorMessage.text = Constants.DEFAULT_ERROR_MESSAGE
            }
        }
    }

    private fun clearInput(){
        SignUpTempVariable.clearUserInfo()
        binding.inputUsername.text?.clear()
        binding.inputEmail.text?.clear()
        binding.inputPassword.text?.clear()
    }

    private suspend fun loginRequest(email:String, password:String):Boolean{
        val (_, loginResponse, _) = ConnexionHttpRequest.login( email, password)
        if(loginResponse.statusCode.toString() != Constants.LOGIN_SUCCES_STATUS) return false
        val loginDataResponse = JSONObject(loginResponse.data.toString(Charsets.UTF_8))
        SocketHandler.setToken(loginDataResponse.getString("access_token").toString())
        SocketHandler.establishConnection()
        CoroutineScope(Dispatchers.IO).launch { MessageServer.startMessageFlow() }
        UnreadMessageTracker.startUnreadMonitoring()
        return true
    }

    private suspend fun setUser():Boolean{
        val (_, userResponse, _) = UsersHttpRequest.userData()
        if(userResponse.statusCode.toString() != Constants.USER_SUCCES_STATUS) return false
        val userDataResponse = JSONObject(userResponse.data.toString(Charsets.UTF_8))
        User.setUsername(userDataResponse.getString("username").toString())
        User.setEmail(userDataResponse.getString("email").toString())
        User.setId(userDataResponse.getString("_id").toString())
        User.setEmailProtection(userDataResponse.getBoolean("isEmailProtected"))
        return true
    }

    private suspend fun setAvatar(): Boolean{

        val tempDefaultImage = SignUpTempVariable.getTempDefaultImage()
        val tempBitmap = SignUpTempVariable.getImageBitmap()

        if(tempBitmap != null ){
            val file = Avatar.generateJpeg(tempBitmap)
            return if(User.setAvatar(file)){
                SignUpTempVariable.clearTempImages()
                true
            }else{
                false
            }
        }
        else if(tempDefaultImage != null){
            return if(User.setDefaultAvatar(tempDefaultImage)) {
                SignUpTempVariable.clearTempImages()
                true
            }else{
                false
            }
        }
        else{
            return false
        }
    }

    private suspend fun setRandomDefaultAvatar(){
        if(!Avatar.fetchAvatarDefaultList() || Avatar.getAvatarList() == null){
            Toast.makeText(activity, Constants.DEFAULT_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
        }else{
            val avatarListLength = Avatar.getAvatarList()?.length()?.minus(1)
            val randomPosition = (0..avatarListLength!!).random()
            val avatarName = Avatar.getAvatarName(randomPosition).toString()
            SignUpTempVariable.setTempDefaultImage(avatarName)
            Picasso.get()
                .load(Constants.DEFAULT_AVATAR_URL + avatarName)
                .memoryPolicy(MemoryPolicy.NO_CACHE)
                .networkPolicy(NetworkPolicy.NO_CACHE)
                .into(binding.avatarImage)
        }
    }

    private fun setEditText(){
        if(SignUpTempVariable.getUsername() != null)
            binding.inputUsername.setText(SignUpTempVariable.getUsername(), TextView.BufferType.EDITABLE)
        if(SignUpTempVariable.getEmail() != null)
            binding.inputEmail.setText(SignUpTempVariable.getEmail(), TextView.BufferType.EDITABLE)
        if(SignUpTempVariable.getPassword() != null){
            binding.inputPassword.setText(SignUpTempVariable.getPassword(), TextView.BufferType.EDITABLE)
        }
    }

    fun hideKeyboard(context: Context, view: View) {
        val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(view.windowToken, 0)
    }

}



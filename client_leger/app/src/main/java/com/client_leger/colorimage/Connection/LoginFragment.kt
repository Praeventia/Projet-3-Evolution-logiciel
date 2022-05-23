package com.client_leger.colorimage.Connection

import android.content.Context
import android.os.Bundle
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.InputMethodManager
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.client_leger.colorimage.Api.Connexion.ConnexionHttpRequest
import com.client_leger.colorimage.Api.Users.UsersHttpRequest
import com.client_leger.colorimage.Avatar.Avatar
import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Chat.data.data_source.MessageServer
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.R
import com.client_leger.colorimage.Regex.Regex
import com.client_leger.colorimage.databinding.FragmentLoginBinding
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

/**
 * A simple [Fragment] subclass as the second destination in the navigation.
 */
class LoginFragment : Fragment() {

    private var _binding: FragmentLoginBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {

        _binding = FragmentLoginBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        val loading = LoadingDialog(requireActivity())
        super.onViewCreated(view, savedInstanceState)

        binding.submitForm.setOnClickListener {
            context?.let { it1 -> hideKeyboard(it1, view) }
            viewLifecycleOwner.lifecycleScope.launch {
                loading.startLoadingDialog()
                login()
                loading.dismissDialog()
            }
        }

        binding.submitForm.setOnKeyListener(View.OnKeyListener{ _, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_UP){
                viewLifecycleOwner.lifecycleScope.launch {
                    login()
                }
                return@OnKeyListener true
            }
            false
        })

        binding.home.setOnClickListener {
            findNavController().navigate(R.id.action_LoginFragment_to_MainFragment)
        }
        binding.signin.setOnClickListener {
            findNavController().navigate(R.id.action_LoginFragment_to_SignUpFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private suspend fun login(){
        val email = binding.inputEmail.text.toString()
        val password:String = binding.inputPassword.text.toString()
        if(Regex.checkEmptyField(email)){
            binding.errorMessage.text = Constants.USER_FIELD_EMPTY
            return
        }
        if(Regex.checkEmptyField(password)){
            binding.errorMessage.text = Constants.PASSWORD_EMPTY
            return
        }
        if(loginRequest(email,password) && userDataRequest() && getAvatar()) {
            Toast.makeText(activity, Constants.LOGIN_SUCCES_MESSAGE , Toast.LENGTH_LONG ).show()
            findNavController().navigate(R.id.action_LoginFragment_to_MainFragment)
        }
    }

    private suspend fun loginRequest(email:String, password:String): Boolean{
        val (_, loginResponse, _) = ConnexionHttpRequest.login( email, password)

        return if(loginResponse.statusCode.toString() == Constants.UNAUTHORIZED_STATUS) {
            val loginDataResponse = JSONObject(loginResponse.data.toString(Charsets.UTF_8))
            binding.errorMessage.text = loginDataResponse.getString("message").toString()
            false
        }else if(loginResponse.statusCode.toString() == Constants.LOGIN_SUCCES_STATUS){
            val loginDataResponse = JSONObject(loginResponse.data.toString(Charsets.UTF_8))
            SocketHandler.setToken(loginDataResponse.getString("access_token").toString())
            SocketHandler.establishConnection()
            CoroutineScope(Dispatchers.IO).launch { MessageServer.startMessageFlow() }
            UnreadMessageTracker.startUnreadMonitoring()
            true
        }else{
            binding.errorMessage.text = Constants.DEFAULT_ERROR_MESSAGE
            false
        }
    }

    private suspend fun userDataRequest(): Boolean{
        val (_, userResponse, _) = UsersHttpRequest.userData()
        val userDataResponse = JSONObject(userResponse.data.toString(Charsets.UTF_8))
        if(userResponse.statusCode.toString() != Constants.USER_SUCCES_STATUS){
            binding.errorMessage.text = userDataResponse.getString("message").toString()
            return false
        }
        else{
            User.setUsername(userDataResponse.getString("username").toString())
            User.setEmail(userDataResponse.getString("email").toString())
            User.setId(userDataResponse.getString("_id").toString())
            User.setEmailProtection(userDataResponse.getBoolean("isEmailProtected"))
            return true
        }
    }

    private suspend fun getAvatar(): Boolean{
        return Avatar.fetchAvatarDefaultList()
    }

    fun hideKeyboard(context: Context, view: View) {
        val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(view.windowToken, 0)
    }
}

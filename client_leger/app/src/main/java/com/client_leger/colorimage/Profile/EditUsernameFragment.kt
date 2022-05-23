package com.client_leger.colorimage.Profile

import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import com.client_leger.colorimage.Api.Users.UsersHttpRequest
import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Avatar.Avatar
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.FragmentEditUsernameBinding
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.Regex.Regex
import com.squareup.picasso.Picasso
import kotlinx.coroutines.launch
import org.json.JSONObject

class EditUsernameFragment : Fragment() {

    private var _binding: FragmentEditUsernameBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentEditUsernameBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        lifecycleScope.launch {
            if (!User.isAuthorized()){
                User.hasBeenDisconnected = true
                User.disconnect()
                Avatar.clearAvatarList()
                SocketHandler.closeConnection()
                findNavController().navigate(R.id.action_EditUsernameFragment_to_MainFragment)
            }
        }

        Picasso.get().load(User.getAvatar()).into(binding.avatarImage)
        binding.username.setText(User.getUsername(), TextView.BufferType.EDITABLE)
        binding.email.text = User.getEmail()

        binding.save.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                saveInfo()
                findNavController().navigate(R.id.action_EditUsernameFragment_to_ProfileFragment)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private suspend fun updateUsername(username: String): Boolean{
        val (_, usernameUpdateResponse, _) = UsersHttpRequest.changeUsername(username)
        return if(usernameUpdateResponse.statusCode.toString() != Constants.USERNAME_UPDATE_SUCCES_STATUS){
            val usernameUpdateDataResponse = JSONObject(usernameUpdateResponse.data.toString(Charsets.UTF_8))
            binding.errorMessage.text = usernameUpdateDataResponse.getString("message").toString()
            false
        } else{
            if(!User.setUserInfo()){
                binding.errorMessage.text = Constants.DEFAULT_ERROR_MESSAGE
                false
            } else{
                true
            }
        }
    }

    private suspend fun saveInfo(){
        val username = binding.username.text.toString()
        if(username != User.getUsername() && !Regex.checkEmptyField(username)){
            if(updateUsername(username)){
                Toast.makeText(activity, Constants.USERNAME_UPDATE_SUCCES_MESSAGE , Toast.LENGTH_LONG ).show()
            }
        }else{
            Toast.makeText(activity, Constants.NO_MODIFICATION_MADE, Toast.LENGTH_LONG ).show()
        }

    }

    private val getContent = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        // Handle the returned Uri
        if(uri == null){
            binding.errorMessage.text = Constants.DEFAULT_ERROR_MESSAGE
            return@registerForActivityResult
        }else{

        }
    }


}

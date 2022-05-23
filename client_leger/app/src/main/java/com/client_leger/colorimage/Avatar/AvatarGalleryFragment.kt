package com.client_leger.colorimage.Avatar

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Connection.SignUpTempVariable
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Avatar.Data.AvatarImageModel
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.FragmentAvatarGalleryBinding
import com.client_leger.colorimage.Model.User
import kotlinx.coroutines.launch

/**
 * An example full-screen fragment that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 */
class AvatarGalleryFragment : Fragment() {

    private var _binding: FragmentAvatarGalleryBinding? = null
    private val binding get() = _binding!!

    private var avatarList:ArrayList<AvatarImageModel> = generateAvatarList()
    private val adapter = AvatarGalleryAdapter(avatarList)

    private var selectedPosition: Int = -1

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentAvatarGalleryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        lifecycleScope.launch {
            if (User.userIsAuthenticated() && !User.isAuthorized()){
                User.hasBeenDisconnected = true
                User.disconnect()
                Avatar.clearAvatarList()
                SocketHandler.closeConnection()
                findNavController().navigate(R.id.action_AvatarGalleryFragment_to_MainFragment)
            }
        }

        binding.recyclerAvatarGallery.adapter = adapter
        binding.recyclerAvatarGallery.layoutManager = GridLayoutManager(context, 3)
        binding.recyclerAvatarGallery.setHasFixedSize(true)

        adapter.setOnItemClickListener(object: AvatarGalleryAdapter.OnItemClickListener{
            override fun onItemClick(position: Int) {
                selectedPosition = position
            }
        } )

        binding.saveButton.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                if(User.userIsAuthenticated()){
                    saveAvatar()
                }else{
                    saveTempAvatar()
                }
            }
        }

    }

    private fun generateAvatarList(): ArrayList<AvatarImageModel>{
        val list = ArrayList<AvatarImageModel>()
        val avatarList = Avatar.getAvatarList()
        if (avatarList != null) {
            for(i in 0 until avatarList.length()){
                val url = AvatarImageModel(avatarList[i].toString(), false)
                list += url
            }
        }
        return list
    }

    private suspend fun saveAvatar(){
        if(selectedPosition < 0 || !avatarList[selectedPosition].isSelected )
            Toast.makeText(activity, Constants.NO_IMAGE_SELECTED, Toast.LENGTH_SHORT).show()
        else {
            if(User.setDefaultAvatar(avatarList[selectedPosition].imageResource)){
                Toast.makeText(activity, Constants.AVATAR_UPDATE_SUCCES_MESSAGE, Toast.LENGTH_SHORT).show()
                findNavController().navigate(R.id.action_AvatarGalleryFragment_to_ProfileFragment)
            }else{
                Toast.makeText(activity, Constants.DEFAULT_ERROR_MESSAGE, Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun saveTempAvatar(){
        if(selectedPosition < 0 || !avatarList[selectedPosition].isSelected )
            Toast.makeText(activity, Constants.NO_IMAGE_SELECTED, Toast.LENGTH_SHORT).show()
        else {
            SignUpTempVariable.setTempDefaultImage(avatarList[selectedPosition].imageResource)
            findNavController().navigate(R.id.action_AvatarGalleryFragment_to_SignUpFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

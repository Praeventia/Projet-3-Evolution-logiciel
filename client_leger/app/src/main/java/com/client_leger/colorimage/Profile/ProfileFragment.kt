package com.client_leger.colorimage.Profile

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.activity.addCallback
import androidx.fragment.app.Fragment
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Avatar.Avatar
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Chat.presentation.ChatActivity
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.FragmentProfileBinding
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.Profile.ConnectionHistory.ConnectionHistoryFragment
import com.client_leger.colorimage.Profile.Slider.DrawingSliderAdapter
import com.client_leger.colorimage.Profile.Slider.data.DrawingSliderData
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.dialogs.CreatePasswordDialogFragment
import com.client_leger.colorimage.drawing.DrawingActivity
import com.client_leger.colorimage.drawing.intermediate.IntermediateDrawingServer
import com.squareup.picasso.MemoryPolicy
import com.squareup.picasso.NetworkPolicy
import com.squareup.picasso.Picasso
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch


class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!

    private var drawingList = ArrayList<DrawingSliderData>()
    private var selectedPosition: Int = -1

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val loading = LoadingDialog(requireActivity())

        lifecycleScope.launch{
            loading.startLoadingDialog()
            if (!User.isAuthorized()){
                User.hasBeenDisconnected = true
                User.disconnect()
                Avatar.clearAvatarList()
                SocketHandler.closeConnection()
                findNavController().navigate(R.id.action_ProfileFragment_to_MainFragment)
                loading.dismissDialog()
                return@launch
            }

            userLoginHistory()
            userDisconnectTime()
            pixelNumber()
            binding.albumsJoined.text = numberOfAlbumsJoined()
            binding.albumsOwn.text = numberAlbumsOwn()
            binding.lastConnection.text = User.getLastLogin().toString()
            binding.totalCollaboration.text = userTotalCollaborationTime()
            binding.averageCollaboration.text = userAverageCollaborationTime()
            binding.drawingContributed.text = numberOfDrawingContributed()
            binding.drawingOwn.text = numberOfDrawingOwn()
            binding.privateAlbums.text = numberPrivateAlbumsJoin()
            binding.messageSent.text = numberMessageSent()

            drawingList = generateList() ?: ArrayList<DrawingSliderData>()
            if(drawingList.size == 0){
                binding.recentDrawingContainer.visibility = View.GONE
            }
            else{
                binding.recentDrawingContainer.visibility = View.VISIBLE
                val adapter = DrawingSliderAdapter(drawingList)
                binding.sliderDrawingRecycler.adapter = adapter
                binding.sliderDrawingRecycler.layoutManager = LinearLayoutManager(context, RecyclerView.HORIZONTAL, false)
                binding.sliderDrawingRecycler.setHasFixedSize(true)

                adapter.setOnItemClickListener(object: DrawingSliderAdapter.OnItemClickListener{
                    override fun onItemClick(position: Int) {
                        selectedPosition = position
                        val drawingSelected = drawingList[selectedPosition]
                        if(drawingSelected.locker && drawingSelected.ownerName != User.getUsername()) {
                            CreatePasswordDialogFragment(drawingSelected.drawingID).show(parentFragmentManager,"password")
                        }else{
                            changeToEditor(drawingList[selectedPosition].drawingID)
                        }
                    }
                } )
            }
            loading.dismissDialog()
        }

        binding.edit.setOnClickListener {
            findNavController().navigate(R.id.action_ProfileFragment_to_EditProfileFragment)
        }

        binding.avatarImage.setOnClickListener {
            findNavController().navigate(R.id.action_ProfileFragment_to_AvatarGalleryFragment)
        }

        binding.loginHistory.setOnClickListener {
            ConnectionHistoryFragment().show(parentFragmentManager, "Popup")
        }

        binding.protectEmail.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                toggleProtectEmail()
            }
        }

        requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner) {
            findNavController().navigate(R.id.action_ProfileFragment_to_MainFragment)
        }

        binding.username.text = User.getUsername()
        binding.email.text = User.getEmail()
        binding.protectEmail.isChecked = User.getEmailProtection()
        Picasso.get()
            .load(User.getAvatar())
            .memoryPolicy(MemoryPolicy.NO_CACHE)
            .networkPolicy(NetworkPolicy.NO_CACHE)
            .into(binding.avatarImage)

        (view.findViewById(R.id.chat_info) as View).visibility = View.VISIBLE
        listenUnreadMessages()

        (getView()?.findViewById(R.id.chat_info) as View).setOnClickListener {
            activity?.let{
                val intent = Intent (it, ChatActivity::class.java)
                it.startActivity(intent)
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun listenUnreadMessages() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                UnreadMessageTracker.unreadMessagesState.onEach {
                    updateUnreadBadge(it.unreadMessagesChannels)
                }.collect()
            }
        }
    }

    private fun updateUnreadBadge(list : Map<String,Int>) {
        val unreadMessages = list.values.sum()

        val messageBadge = view?.findViewById<TextView>(R.id.new_message_badge)

        if (unreadMessages > 0) {
            messageBadge!!.visibility  = View.VISIBLE
            messageBadge.text = unreadMessages.toString()
        }
        else {
            messageBadge!!.visibility  = View.INVISIBLE
        }
    }

    private suspend fun userLoginHistory(){
        User.fetchLoginHistory()
    }

    private suspend fun userDisconnectTime(){
        User.fetchDisconnectTime()
    }

    private suspend fun userTotalCollaborationTime():String{
        val time:String = User.fetchUserTotalCollaborationTime()
        return Timestamp.secondsToHours(time)
    }

    private suspend fun userAverageCollaborationTime():String{
        val time:String = User.fetchUserAverageCollaborationTime()
        return Timestamp.secondsToHours(time)
    }

    private suspend fun numberAlbumsOwn():String{
        return IntermediateAlbumServer.getNumberAllOwnedAlbum()
    }

    private suspend fun numberPrivateAlbumsJoin():String{
        return IntermediateAlbumServer.allPrivateAlbumJoin()
    }

    private suspend fun numberMessageSent():String{
        return User.numberOfMessageSentUser()
    }

    private suspend fun numberOfAlbumsJoined(): String{
        val albums = IntermediateAlbumServer.getAllAlbumsJoinData()
        return albums?.size?.toString() ?: "0"
    }

    private suspend fun numberOfDrawingContributed(): String{
        val drawings = IntermediateDrawingServer.getNumberOfDrawingsContributed()
        return drawings?.toString() ?: "0"
    }

    private suspend fun numberOfDrawingOwn(): String{
        val drawings = IntermediateDrawingServer.getNumberOfDrawingsOwn()
        return drawings?.toString() ?: "0"
    }

    private suspend fun pixelNumber(){
        binding.pixelCross.text = User.numberOfPixelCrossUser()
    }

    private suspend fun toggleProtectEmail(){
        if(User.requestEmailProtection()){
            val emailProtection = !User.getEmailProtection()
            User.setEmailProtection(emailProtection)
            binding.protectEmail.isChecked = emailProtection
        }
        else{
            binding.protectEmail.isChecked = User.getEmailProtection()
            Toast.makeText(activity, Constants.DEFAULT_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
        }
    }

    private suspend fun generateList(): ArrayList<DrawingSliderData>? {
        return IntermediateDrawingServer.recentDrawingsSlider()
    }

    private fun changeToEditor(drawingID: String ){
        activity.let {
            val intent = Intent(it, DrawingActivity::class.java)
            intent.putExtra("drawingID", drawingID)
            startActivity(intent)
        }
    }

}

package com.client_leger.colorimage.album

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.album.adapter.AddUsersToAlbumAdapter
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.databinding.FragmentAddUsersToAlbumBinding
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import kotlinx.coroutines.*

class AddUsersToAlbumFragment : Fragment() {

    private var _binding: FragmentAddUsersToAlbumBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    val binding get() = _binding!!

    private lateinit var jobRefreshList : Job
    lateinit var albumID : String
    lateinit var adapter: AddUsersToAlbumAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        adapter = AddUsersToAlbumAdapter(this)
        albumID = (parentFragment as DrawingInAlbumFragment).albumId
        fetchListUsers()
        _binding = FragmentAddUsersToAlbumBinding.inflate(inflater, container, false)
        binding.userList.adapter = adapter

        jobRefreshList = refreshListUsers()
        return binding.root
    }

    override fun onDestroy() {
        super.onDestroy()
        _binding = null
        if (jobRefreshList.isActive)
            jobRefreshList.cancel()
    }

    override fun onStop() {
        super.onStop()
        jobRefreshList.cancel()
    }

    override fun onStart() {
        super.onStart()
        jobRefreshList = refreshListUsers()
    }

    private fun refreshListUsers() : Job {
        return viewLifecycleOwner.lifecycleScope.launch (context = Dispatchers.Main){
            while (isActive){
                delay(5000)
                val listUsers = IntermediateAlbumServer.getAllUserRequestingToJoin(albumID)
                if (listUsers != null){
                    adapter.submitList(listUsers)
                    (parentFragment as DrawingInAlbumFragment).binding.joinIsEmpty = listUsers.isEmpty()
                }
                else{
                    CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(parentFragmentManager, "Error")
                    this.cancel()
                }
            }
        }
    }

    private fun fetchListUsers() {
         lifecycleScope.launch (context = Dispatchers.Main){
            val listUsers = IntermediateAlbumServer.getAllUserRequestingToJoin(albumID)
            if (listUsers != null){
                adapter.submitList(listUsers)
                (parentFragment as DrawingInAlbumFragment).binding.joinIsEmpty = listUsers.isEmpty()
            }
            else{
                CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(parentFragmentManager, "Error")
                this.cancel()
            }
        }
    }

    fun updateJoinIsEmpty(isEmpty : Boolean){
        (parentFragment as DrawingInAlbumFragment).binding.joinIsEmpty = isEmpty
    }

    fun restartRefresh(){
        jobRefreshList.cancel()
        jobRefreshList = refreshListUsers()
    }
}

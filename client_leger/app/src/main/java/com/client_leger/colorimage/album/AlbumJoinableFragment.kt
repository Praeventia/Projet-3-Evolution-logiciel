package com.client_leger.colorimage.album

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.album.adapter.AlbumJoinableAdapter
import com.client_leger.colorimage.album.data.AlbumJoinableData
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.databinding.FragmentAlbumJoinableBinding
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import com.client_leger.colorimage.Model.User
import kotlinx.coroutines.*

class AlbumJoinableFragment : Fragment() {

    private var _binding: FragmentAlbumJoinableBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    val binding get() = _binding!!

    private lateinit var adapter: AlbumJoinableAdapter
    private lateinit var jobRefreshList : Job
    private lateinit var loading: LoadingDialog

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        adapter = AlbumJoinableAdapter()
        loading = LoadingDialog(requireActivity())
        _binding = FragmentAlbumJoinableBinding.inflate(inflater, container, false)

        fetchForList()

        binding.albumList.adapter = adapter

        jobRefreshList = askForList()
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
        jobRefreshList = askForList()
    }

    @SuppressLint("NotifyDataSetChanged")
    private fun askForList() : Job{
        return lifecycleScope.launch(context = Dispatchers.Main) {
            val userID = User.getId()
            val listAdapter: MutableList<AlbumJoinableData> = ArrayList()
            while (isActive) {
                delay(5000)
                val allAlbums = IntermediateAlbumServer.getAllAlbums()
                listAdapter.clear()

                if (allAlbums != null) {
                    allAlbums.forEach { albumData ->
                        if (!albumData.isJoin) {
                            val userRequests =
                                IntermediateAlbumServer.getAllUserRequestingToJoin(albumData.albumId)
                            if (userRequests != null) {
                                var requestPending = false
                                userRequests.forEach { userData ->
                                    if (userID == userData.userID) {
                                        requestPending = true
                                    }
                                }
                                val albumJoinableData = AlbumJoinableData(
                                    albumData.albumName,
                                    albumData.albumId,
                                    albumData.description,
                                    requestPending,
                                )
                                listAdapter.add(albumJoinableData)
                            } else {
                                CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(
                                    parentFragmentManager,
                                    "Error"
                                )
                                this.cancel()
                            }
                        }
                    }
                    adapter.submitList(listAdapter)
                    adapter.notifyDataSetChanged()
                    binding.isEmpty = listAdapter.isEmpty()
                } else {
                    CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(
                        parentFragmentManager,
                        "Error"
                    )
                    this.cancel()
                }
            }
        }
    }

    private fun fetchForList(){
        lifecycleScope.launch(context = Dispatchers.Main) {
            loading.startLoadingDialog()
            val userID = User.getId()
            val listAdapter: MutableList<AlbumJoinableData> = ArrayList()
            val allAlbums = IntermediateAlbumServer.getAllAlbums()
            if (allAlbums != null) {
                allAlbums.forEach { albumData ->
                    if (!albumData.isJoin) {
                        val userRequests =
                            IntermediateAlbumServer.getAllUserRequestingToJoin(albumData.albumId)
                        if (userRequests != null) {
                            var requestPending = false
                            userRequests.forEach { userData ->
                                if (userID == userData.userID) {
                                    requestPending = true
                                }
                            }
                            val albumJoinableData = AlbumJoinableData(
                                albumData.albumName,
                                albumData.albumId,
                                albumData.description,
                                requestPending,
                            )
                            listAdapter.add(albumJoinableData)
                        } else {
                            CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(
                                parentFragmentManager,
                                "Error"
                            )
                            this.cancel()
                        }
                    }
                }
                adapter.submitList(listAdapter)
                binding.isEmpty = listAdapter.isEmpty()
            } else {
                CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(
                    parentFragmentManager,
                    "Error"
                )
                this.cancel()
            }
            loading.dismissDialog()
        }
    }
}

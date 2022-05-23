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
import com.client_leger.colorimage.album.adapter.AlbumExpositionAdapter
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.databinding.FragmentAlbumExpositionBinding
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import kotlinx.coroutines.*

class AlbumExpositionFragment : Fragment() {

    private var _binding: FragmentAlbumExpositionBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    val binding get() = _binding!!


    lateinit var adapter: AlbumExpositionAdapter
    private lateinit var loading: LoadingDialog
    private lateinit var jobRefreshList : Job

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        adapter = AlbumExpositionAdapter()
        loading = LoadingDialog(requireActivity())
        _binding = FragmentAlbumExpositionBinding.inflate(inflater, container, false)

        fetchListAlbums()

        binding.albumList.adapter = adapter
        jobRefreshList = refreshListAlbums()
        return binding.root
    }

    override fun onStop() {
        super.onStop()
        jobRefreshList.cancel()
    }

    override fun onStart() {
        super.onStart()
        jobRefreshList = refreshListAlbums()
    }

    @SuppressLint("NotifyDataSetChanged")
    private fun refreshListAlbums() : Job {
        return viewLifecycleOwner.lifecycleScope.launch {
            while (isActive) {
                delay(5000)
                val listAlbums = IntermediateAlbumServer.getAllAlbumWithExposition()
                if (listAlbums != null) {
                    adapter.submitList(listAlbums)
                    adapter.notifyDataSetChanged()
                    binding.isEmpty = listAlbums.isEmpty()
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

    private fun fetchListAlbums() {
        lifecycleScope.launch {
            loading.startLoadingDialog()
            val listAlbums = IntermediateAlbumServer.getAllAlbumWithExposition()
            if (listAlbums != null) {
                adapter.submitList(listAlbums)
                binding.isEmpty = listAlbums.isEmpty()
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

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
import com.client_leger.colorimage.album.adapter.AlbumUserAdapter
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.databinding.FragmentAlbumUserBinding
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import kotlinx.coroutines.*


class AlbumUserFragment : Fragment() {

    private var _binding: FragmentAlbumUserBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    val binding get() = _binding!!

    lateinit var adapter: AlbumUserAdapter
    private lateinit var jobRefreshList : Job
    private lateinit var loading: LoadingDialog

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        loading = LoadingDialog(requireActivity())
        adapter = AlbumUserAdapter(this)
        fetchListAlbums()
        _binding = FragmentAlbumUserBinding.inflate(inflater, container, false)
        binding.albumList.adapter = adapter
        jobRefreshList = refreshListAlbums()
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
        jobRefreshList = refreshListAlbums()
    }

    @SuppressLint("NotifyDataSetChanged")
    private fun refreshListAlbums() : Job{
        return viewLifecycleOwner.lifecycleScope.launch {
            while (isActive) {
                delay(5000)
                val listAlbums = IntermediateAlbumServer.getAllAlbumsJoinData()
                if (listAlbums != null) {
                    adapter.submitList(listAlbums)
                    adapter.notifyDataSetChanged()
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

    private fun fetchListAlbums(){
        lifecycleScope.launch {
            loading.startLoadingDialog()
            val listAlbums = IntermediateAlbumServer.getAllAlbumsJoinData()
            if (listAlbums != null) {
                adapter.submitList(listAlbums)
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

    fun restartRefresh(){
        jobRefreshList.cancel()
        jobRefreshList = refreshListAlbums()
    }
}

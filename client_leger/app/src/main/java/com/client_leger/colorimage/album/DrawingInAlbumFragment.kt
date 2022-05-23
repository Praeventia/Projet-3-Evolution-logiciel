package com.client_leger.colorimage.album

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.R
import com.client_leger.colorimage.album.adapter.DrawingInAlbumAdapter
import com.client_leger.colorimage.album.data.intermediate.IntermediateDrawingInAlbumServer
import com.client_leger.colorimage.databinding.FragmentDrawingInAlbumBinding
import com.client_leger.colorimage.dialogs.CreateDrawingDialogFragment
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import kotlinx.coroutines.*


class DrawingInAlbumFragment : Fragment() {

    companion object{
        var isViewer : Boolean = false
        var isPublic : Boolean = false
    }

    private var tab : Int = 0
    private var userPanelShow : Boolean = false

    private var _binding: FragmentDrawingInAlbumBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    val binding get() = _binding!!

    lateinit var albumId : String
    private lateinit var albumName : String
    private lateinit var jobRefreshList : Job
    private lateinit var loading : LoadingDialog

    lateinit var adapter: DrawingInAlbumAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        // Arguments
        loading = LoadingDialog(requireActivity())
        albumId = arguments?.getString("albumId").toString()
        albumName = arguments?.getString("albumName").toString()
        isViewer = arguments?.getBoolean("viewer")!!
        isPublic = arguments?.getBoolean("isPublic")!!
        tab = arguments?.getInt("tab")!!

        adapter = DrawingInAlbumAdapter(this)

        _binding = FragmentDrawingInAlbumBinding.inflate(inflater, container, false)
        binding.drawingList.adapter = adapter
        binding.title.text = arguments?.getString("albumTitle").toString()

        if (isViewer) {
            fetchListDrawingsExposition()
        } else{
            fetchListDrawingsEdition()
        }


        binding.isPublic = isPublic
        binding.isViewer = isViewer
        binding.addDrawing.setOnClickListener {
            val dialog = CreateDrawingDialogFragment(albumName, this)
            dialog.show(parentFragmentManager, "")
        }

        binding.addDrawingTop.setOnClickListener {
            val dialog = CreateDrawingDialogFragment(albumName, this)
            dialog.show(parentFragmentManager, "")
        }

        binding.fragmentContainerView.animate().translationX(-binding.fragmentContainerView.width.toFloat()).alpha(0.0f)
        binding.fragmentContainerView.visibility = View.GONE
        binding.emptyAddUser.animate().translationX(-binding.fragmentContainerView.width.toFloat()).alpha(0.0f)
        binding.addPeople.setOnClickListener {
            if(!userPanelShow){
                userPanelShow = true
                binding.fragmentContainerView.visibility = View.VISIBLE
                binding.fragmentContainerView.animate().translationX(0f)
                    .alpha(1.0f)
                    .setListener(null)
                binding.emptyAddUser.animate().translationX(0f)
                    .alpha(1.0f)
                    .setListener(null)
            }
            else{
                userPanelShow = false
                binding.fragmentContainerView.animate().translationX(-binding.fragmentContainerView.width.toFloat())
                    .alpha(0.0f)
                    .setListener(object : AnimatorListenerAdapter() {
                        override fun onAnimationEnd(animation: Animator) {
                            super.onAnimationEnd(animation)
                            binding.fragmentContainerView.visibility = View.GONE
                        }
                    })
                binding.emptyAddUser.animate().translationX(-binding.fragmentContainerView.width.toFloat())
                    .alpha(0.0f)
            }
        }

        binding.back.setOnClickListener {
            val homeViewPagerFragment = HomeViewPagerFragment()
            val args = Bundle()
            args.putInt("tab", tab)
            homeViewPagerFragment.arguments = args
            (view?.context as AlbumActivity).supportFragmentManager.beginTransaction().replace(R.id.nav_host_fragment_album, homeViewPagerFragment).commit()
        }

        binding.fullScreenContainer.setOnClickListener {
            it.visibility = View.GONE
        }

        jobRefreshList = if (isViewer) {
            refreshListDrawingsExposition()
        } else{
            refreshListDrawingsEdition()
        }

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
        jobRefreshList = if (isViewer) {
            refreshListDrawingsExposition()
        } else{
            refreshListDrawingsEdition()
        }
    }

    private fun fetchListDrawingsEdition() {
        lifecycleScope.launch (context = Dispatchers.Main){
            loading.startLoadingDialog()
            val listDrawings = IntermediateDrawingInAlbumServer.getAllDrawings(albumId)
            if (listDrawings != null){
                adapter.submitList(listDrawings)
                binding.isEmpty = listDrawings.isEmpty()
            }
            else{
                CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(parentFragmentManager, "Error")
                this.cancel()
            }
            loading.dismissDialog()
        }
    }

    private fun fetchListDrawingsExposition() {
        lifecycleScope.launch (context = Dispatchers.Main){
            loading.startLoadingDialog()
            val listDrawings = IntermediateDrawingInAlbumServer.allExposedDrawingInAlbum(albumId)
            if (listDrawings != null){
                adapter.submitList(listDrawings)
                binding.isEmpty = listDrawings.isEmpty()
            }
            else{
                CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(parentFragmentManager, "Error")
                this.cancel()
            }
            loading.dismissDialog()
        }
    }

    @SuppressLint("NotifyDataSetChanged")
    private fun refreshListDrawingsEdition() : Job {
        return lifecycleScope.launch (context = Dispatchers.Main){
            while (isActive){
                delay(5000)
                val listDrawings = IntermediateDrawingInAlbumServer.getAllDrawings(albumId)
                if (listDrawings != null){
                    adapter.submitList(listDrawings)
                    adapter.notifyDataSetChanged()
                    binding.isEmpty = listDrawings.isEmpty()
                }
                else{
                    CreateErrorDialog(Constants.ERROR_MESSAGE_CONNECTION_SERVER).show(parentFragmentManager, "Error")
                    this.cancel()
                }
            }
        }
    }

    @SuppressLint("NotifyDataSetChanged")
    private fun refreshListDrawingsExposition() : Job {
        return lifecycleScope.launch (context = Dispatchers.Main){
            while (isActive){
                delay(5000)
                val listDrawings = IntermediateDrawingInAlbumServer.allExposedDrawingInAlbum(albumId)
                if (listDrawings != null){
                    adapter.submitList(listDrawings)
                    adapter.notifyDataSetChanged()
                    binding.isEmpty = listDrawings.isEmpty()
                }
                else{
                    CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(parentFragmentManager, "Error")
                    this.cancel()
                }
            }
        }
    }

    fun restartRefresh(){
        jobRefreshList.cancel()

        jobRefreshList = if (isViewer) {
            refreshListDrawingsExposition()
        } else{
            refreshListDrawingsEdition()
        }
    }


}

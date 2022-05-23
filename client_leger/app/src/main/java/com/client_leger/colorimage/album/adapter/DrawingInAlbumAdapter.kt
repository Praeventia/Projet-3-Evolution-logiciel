package com.client_leger.colorimage.album.adapter

import android.content.Intent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.coroutineScope
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.R
import com.client_leger.colorimage.album.AlbumActivity
import com.client_leger.colorimage.album.DrawingInAlbumFragment
import com.client_leger.colorimage.album.data.DrawingData
import com.client_leger.colorimage.album.data.intermediate.IntermediateDrawingInAlbumServer
import com.client_leger.colorimage.album.view_model.DrawingViewModel
import com.client_leger.colorimage.databinding.ListItemDrawingBinding
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import com.client_leger.colorimage.dialogs.CreatePasswordDialogFragment
import com.client_leger.colorimage.drawing.DrawingActivity
import kotlinx.coroutines.launch

class DrawingInAlbumAdapter(val drawingInAlbumFragment : DrawingInAlbumFragment): ListAdapter<DrawingData, DrawingInAlbumAdapter.ViewHolderDrawing>(DrawingDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): DrawingInAlbumAdapter.ViewHolderDrawing {
        return ViewHolderDrawing(
            DataBindingUtil.inflate(
                LayoutInflater.from(parent.context),
                R.layout.list_item_drawing,
                parent,
                false
            )
        )
    }

    override fun onBindViewHolder(holder: DrawingInAlbumAdapter.ViewHolderDrawing, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolderDrawing(private val binding : ListItemDrawingBinding) : RecyclerView.ViewHolder(binding.root){
        init {

            binding.isViewer = DrawingInAlbumFragment.isViewer
            binding.isPublic = DrawingInAlbumFragment.isPublic


            binding.viewer.setOnClickListener {
                val albumActivity = (it.context as AlbumActivity)
                albumActivity.lifecycle.coroutineScope.launch{
                    val result = IntermediateDrawingInAlbumServer.changeDrawingExposition(binding.viewModel?.drawingId.toString())
                    if (result.isFailure){
                        CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(albumActivity.supportFragmentManager, "Error")
                    }
                    else{
                        currentList[absoluteAdapterPosition].isExposed = true
                        notifyItemChanged(absoluteAdapterPosition)
                    }
                }
            }

            binding.viewerUnexpose.setOnClickListener {
                val albumActivity = (it.context as AlbumActivity)
                albumActivity.lifecycle.coroutineScope.launch{
                    val result = IntermediateDrawingInAlbumServer.changeDrawingExposition(binding.viewModel?.drawingId.toString())
                    if (result.isFailure){
                        CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(albumActivity.supportFragmentManager, "Error")
                    }
                    else{
                        currentList[absoluteAdapterPosition].isExposed = false
                        notifyItemChanged(absoluteAdapterPosition)
                    }
                }
            }

            binding.delete.setOnClickListener {
                val albumActivity = (it.context as AlbumActivity)
                albumActivity.lifecycle.coroutineScope.launch{
                    val result = IntermediateDrawingInAlbumServer.deleteDrawing(binding.viewModel?.drawingId.toString())
                    if (result.isFailure){
                        CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(albumActivity.supportFragmentManager, "Error")
                    }
                    else{
                        val list = drawingInAlbumFragment.adapter.currentList.toMutableList()
                        list.removeAt(absoluteAdapterPosition)
                        notifyItemRemoved(absoluteAdapterPosition)
                        drawingInAlbumFragment.adapter.submitList(list)
                        drawingInAlbumFragment.binding.isEmpty = list.isEmpty()
                        drawingInAlbumFragment.restartRefresh()
                    }
                }
            }

            binding.setClickListener { view ->
                if(binding.isViewer){
                    drawingInAlbumFragment.binding.fullScreenContainer.setImageBitmap(currentList[absoluteAdapterPosition].bitmap)
                    drawingInAlbumFragment.binding.fullScreenContainer.visibility = View.VISIBLE
                }
                else {
                    when {
                        binding.viewModel!!.isOwner -> {
                            binding.viewModel?.drawingId?.let { id ->
                                navigateToEditor(id, view, true)
                            }
                        }
                        binding.viewModel!!.needPassword -> {
                            val albumActivity = (view.context as AlbumActivity)
                            CreatePasswordDialogFragment(currentList[absoluteAdapterPosition].drawingId).show(
                                albumActivity.supportFragmentManager,
                                "password"
                            )
                        }
                        else -> {
                            binding.viewModel?.drawingId?.let { id ->
                                navigateToEditor(id, view, false)
                            }
                        }
                    }
                }
            }
        }

        private fun navigateToEditor(drawingID: String, view: View, isOwner: Boolean){
            val intent = Intent((view.context as AlbumActivity).baseContext, DrawingActivity::class.java)
            intent.putExtra("drawingID", drawingID)
            intent.putExtra("isOwner", isOwner)
            (view.context as AlbumActivity).startActivity(intent)
        }

        fun bind(drawing: DrawingData){
            with(binding){
                viewModel = DrawingViewModel(drawing)

                if (drawing.bitmap != null){
                    binding.imageAlbum.setImageBitmap(drawing.bitmap)
                }

                executePendingBindings()
            }
        }
    }
}

class DrawingDiffCallback : DiffUtil.ItemCallback<DrawingData>() {

    override fun areItemsTheSame(
        oldItem: DrawingData,
        newItem: DrawingData
    ): Boolean {
        return oldItem.drawingId == newItem.drawingId
    }

    override fun areContentsTheSame(
        oldItem: DrawingData,
        newItem: DrawingData
    ): Boolean {
        return oldItem == newItem
    }
}

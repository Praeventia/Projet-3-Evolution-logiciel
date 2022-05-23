package com.client_leger.colorimage.album.adapter

import android.annotation.SuppressLint
import android.text.method.ScrollingMovementMethod
import android.view.LayoutInflater
import android.view.MotionEvent
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
import com.client_leger.colorimage.album.data.AlbumJoinableData
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.album.view_model.AlbumsJoinableViewModel
import com.client_leger.colorimage.databinding.ListItemAlbumJoinableBinding
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import kotlinx.coroutines.launch

class AlbumJoinableAdapter : ListAdapter<AlbumJoinableData, AlbumJoinableAdapter.ViewHolderAlbum>(AlbumJoinableDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderAlbum {
        return ViewHolderAlbum(
            DataBindingUtil.inflate(
                LayoutInflater.from(parent.context),
                R.layout.list_item_album_joinable,
                parent,
                false
            )
        )
    }

    override fun onBindViewHolder(holder: ViewHolderAlbum, position: Int) {
        holder.bind(getItem(position))
    }

    @SuppressLint("ClickableViewAccessibility")
    inner class ViewHolderAlbum(private val binding : ListItemAlbumJoinableBinding) : RecyclerView.ViewHolder(binding.root){
        init {

            binding.join.setOnClickListener {
                val albumActivity = (it.context as AlbumActivity)
                albumActivity.lifecycle.coroutineScope.launch{
                    val result = IntermediateAlbumServer.requestToJoinAlbum(binding.viewModel?.albumId.toString())
                    if (result.isFailure){
                        CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(albumActivity.supportFragmentManager, "Error")
                    }
                    else{
                        currentList[absoluteAdapterPosition].requestPending = true
                        notifyItemChanged(absoluteAdapterPosition)
                    }
                }
            }

            binding.description.movementMethod = ScrollingMovementMethod()
            binding.description.setOnTouchListener{ view : View, _ : MotionEvent ->
                view.parent.requestDisallowInterceptTouchEvent(true)
                return@setOnTouchListener false
            }
        }

        fun bind(album: AlbumJoinableData){
            with(binding){
                viewModel = AlbumsJoinableViewModel(album)
                executePendingBindings()
            }
        }
    }
}

class AlbumJoinableDiffCallback : DiffUtil.ItemCallback<AlbumJoinableData>() {

    override fun areItemsTheSame(
        oldItem: AlbumJoinableData,
        newItem: AlbumJoinableData
    ): Boolean {
        return oldItem.albumId == newItem.albumId && oldItem.requestPending == newItem.requestPending
    }

    override fun areContentsTheSame(
        oldItem: AlbumJoinableData,
        newItem: AlbumJoinableData
    ): Boolean {
        return oldItem == newItem
    }
}


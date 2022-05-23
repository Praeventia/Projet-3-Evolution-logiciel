package com.client_leger.colorimage.album.adapter

import android.annotation.SuppressLint
import android.os.Bundle
import android.text.method.ScrollingMovementMethod
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.R
import com.client_leger.colorimage.album.AlbumActivity
import com.client_leger.colorimage.album.DrawingInAlbumFragment
import com.client_leger.colorimage.album.data.AlbumData
import com.client_leger.colorimage.album.view_model.AlbumsViewModel
import com.client_leger.colorimage.databinding.ListItemAlbumExpositionBinding

class AlbumExpositionAdapter : ListAdapter<AlbumData, AlbumExpositionAdapter.ViewHolderAlbum>(AlbumDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderAlbum {
        return ViewHolderAlbum(
            DataBindingUtil.inflate(
                LayoutInflater.from(parent.context),
                R.layout.list_item_album_exposition,
                parent,
                false
            )
        )
    }

    override fun onBindViewHolder(holder: ViewHolderAlbum, position: Int) {
        holder.bind(getItem(position))
    }

    @SuppressLint("ClickableViewAccessibility")
    inner class ViewHolderAlbum(private val binding : ListItemAlbumExpositionBinding) : RecyclerView.ViewHolder(binding.root){
        init {
            binding.setClickListener { view ->
                val name = binding.viewModel!!.albumName
                binding.viewModel?.albumId?.let { id ->
                    navigateToDraw(id,view, name)
                }
            }

            binding.description.movementMethod = ScrollingMovementMethod()
            binding.description.setOnTouchListener{ view : View, _ : MotionEvent ->
                view.parent.requestDisallowInterceptTouchEvent(true)
                return@setOnTouchListener false
            }
        }

        private fun navigateToDraw(albumID: String, view: View, name:String){
            val drawingFragment = DrawingInAlbumFragment()
            val args = Bundle()
            args.putString("albumId", albumID)
            args.putString("albumName", "")
            args.putString("albumTitle", "Exposition de l'album : $name")
            args.putBoolean("viewer", true)
            args.putBoolean("isPublic", false)
            args.putInt("tab", 2)
            drawingFragment.arguments = args
            (view.context as AlbumActivity).supportFragmentManager.beginTransaction().replace(R.id.nav_host_fragment_album, drawingFragment).commit()
        }

        fun bind(album: AlbumData){
            with(binding){
                viewModel = AlbumsViewModel(album)
                executePendingBindings()
            }
        }
    }

}


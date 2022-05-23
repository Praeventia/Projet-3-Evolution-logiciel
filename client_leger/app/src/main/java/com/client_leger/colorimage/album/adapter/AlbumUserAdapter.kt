package com.client_leger.colorimage.album.adapter

import android.annotation.SuppressLint
import android.os.Bundle
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
import com.client_leger.colorimage.album.AlbumUserFragment
import com.client_leger.colorimage.album.DrawingInAlbumFragment
import com.client_leger.colorimage.album.data.AlbumData
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.album.view_model.AlbumsViewModel
import com.client_leger.colorimage.databinding.ListItemAlbumUserBinding
import com.client_leger.colorimage.dialogs.CreateAlbumModificationDialogFragment
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AlbumUserAdapter(val albumUserFragment : AlbumUserFragment) : ListAdapter<AlbumData, AlbumUserAdapter.ViewHolderAlbum>(AlbumDiffCallback())
{

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderAlbum {
        return ViewHolderAlbum(
            DataBindingUtil.inflate(
                LayoutInflater.from(parent.context),
                R.layout.list_item_album_user,
                parent,
                false
            )
        )
    }

    override fun onBindViewHolder(holder: ViewHolderAlbum, position: Int) {
        holder.bind(getItem(position))
    }

    @SuppressLint("ClickableViewAccessibility")
    inner class ViewHolderAlbum(private val binding : ListItemAlbumUserBinding) : RecyclerView.ViewHolder(binding.root){
        init {

            binding.leave.setOnClickListener {
                val albumActivity = (it.context as AlbumActivity)
                albumActivity.lifecycle.coroutineScope.launch(context = Dispatchers.Main){
                    val result = IntermediateAlbumServer.removeUserFromAlbum(binding.viewModel?.albumId.toString())
                    if (result.isFailure){
                        CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(albumActivity.supportFragmentManager, "Error")
                    }
                    else{
                        updateList()
                    }
                }
            }

            binding.setClickListener { view ->
                val name = binding.viewModel!!.albumName
                val isPublic = name == "Public"
                binding.viewModel?.albumId?.let { id ->
                    navigateToDraw(id,view, name, isPublic)
                }
            }

            binding.delete.setOnClickListener {
                val albumActivity = (it.context as AlbumActivity)
                albumActivity.lifecycle.coroutineScope.launch(context = Dispatchers.Main){
                    val result = IntermediateAlbumServer.deleteAlbum(binding.viewModel?.albumId.toString())
                    if (result.isFailure){
                        CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(albumActivity.supportFragmentManager, "Error")
                    }
                    else{
                        updateList()
                    }
                }
            }

            binding.edit.setOnClickListener {
                val dialog = CreateAlbumModificationDialogFragment(binding.viewModel!!.albumId,
                    binding.viewModel!!.albumName,
                    binding.viewModel!!.description,
                    absoluteAdapterPosition, this@AlbumUserAdapter )
                dialog.show(albumUserFragment.parentFragmentManager, "")
            }

            binding.description.movementMethod = ScrollingMovementMethod()
            binding.description.setOnTouchListener{ view : View, _ : MotionEvent ->
                view.parent.requestDisallowInterceptTouchEvent(true)
                return@setOnTouchListener false
            }

        }

        private fun navigateToDraw(albumID: String, view: View, name:String, isPublic: Boolean){
            val drawingFragment = DrawingInAlbumFragment()
            val args = Bundle()
            args.putString("albumId", albumID)
            args.putString("albumName", name)
            args.putString("albumTitle", name)
            args.putBoolean("viewer", false)
            args.putBoolean("isPublic", isPublic)
            args.putInt("tab", 0)
            drawingFragment.arguments = args
            (view.context as AlbumActivity).supportFragmentManager.beginTransaction().replace(R.id.nav_host_fragment_album, drawingFragment).commit()
        }

        private fun updateList(){
            val list = currentList.toMutableList()
            list.removeAt(absoluteAdapterPosition)
            albumUserFragment.adapter.notifyItemRemoved(absoluteAdapterPosition)
            albumUserFragment.adapter.submitList(list)
            albumUserFragment.restartRefresh()
        }

        fun bind(album: AlbumData){
            with(binding){
                viewModel = AlbumsViewModel(album)
                executePendingBindings()
            }
        }
    }

}

class AlbumDiffCallback : DiffUtil.ItemCallback<AlbumData>() {

    override fun areItemsTheSame(
        oldItem: AlbumData,
        newItem: AlbumData
    ): Boolean {
        return oldItem.albumId == newItem.albumId
    }

    override fun areContentsTheSame(
        oldItem: AlbumData,
        newItem: AlbumData
    ): Boolean {
        return oldItem == newItem
    }
}

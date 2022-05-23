package com.client_leger.colorimage.album.adapter

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.coroutineScope
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.R
import com.client_leger.colorimage.album.AddUsersToAlbumFragment
import com.client_leger.colorimage.album.AlbumActivity
import com.client_leger.colorimage.album.data.UserData
import com.client_leger.colorimage.album.data.intermediate.IntermediateAlbumServer
import com.client_leger.colorimage.album.view_model.UserToAlbumViewModel
import com.client_leger.colorimage.databinding.ListUserJoiningAlbumBinding
import com.client_leger.colorimage.dialogs.CreateErrorDialog
import com.squareup.picasso.MemoryPolicy
import com.squareup.picasso.NetworkPolicy
import com.squareup.picasso.Picasso
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class AddUsersToAlbumAdapter(val addUsersToAlbumFragment: AddUsersToAlbumFragment) :
    ListAdapter<UserData, AddUsersToAlbumAdapter.ViewHolderUser>(UserJoinableDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): AddUsersToAlbumAdapter.ViewHolderUser {
        return ViewHolderUser(
            DataBindingUtil.inflate(
                LayoutInflater.from(parent.context),
                R.layout.list_user_joining_album,
                parent,
                false
            )
        )
    }
    override fun onBindViewHolder(holder: ViewHolderUser, position: Int) {
        holder.bind(getItem(position))
    }

    @SuppressLint("ClickableViewAccessibility")
    inner class ViewHolderUser(private val binding : ListUserJoiningAlbumBinding) : RecyclerView.ViewHolder(binding.root){
        init {

            binding.accept.setOnClickListener {
                val albumActivity = (it.context as AlbumActivity)
                albumActivity.lifecycle.coroutineScope.launch(context = Dispatchers.Main){
                    val result = IntermediateAlbumServer.allowUserToJoinPrivateAlbum(
                        addUsersToAlbumFragment.albumID,
                        binding.viewModel!!.userID)
                    if (result.isFailure){
                        CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(albumActivity.supportFragmentManager, "Error")
                    }
                    else{
                        updateList()
                    }
                }
            }

            binding.refuse.setOnClickListener {
                val albumActivity = (it.context as AlbumActivity)
                albumActivity.lifecycle.coroutineScope.launch(context = Dispatchers.Main){
                    val result = IntermediateAlbumServer.rejectUserToJoinPrivateAlbum(
                        addUsersToAlbumFragment.albumID,
                        binding.viewModel!!.userID)
                    if (result.isFailure){
                        CreateErrorDialog(Constants.DEFAULT_ERROR_MESSAGE).show(albumActivity.supportFragmentManager, "Error")
                    }
                    else{
                        updateList()
                    }
                }
            }
        }

        fun bind(user: UserData){
            with(binding){
                viewModel = UserToAlbumViewModel(user)
                executePendingBindings()

                Picasso.get()
                    .load(Constants.USER_AVATAR_URL + viewModel?.userName)
                    .memoryPolicy(MemoryPolicy.NO_CACHE)
                    .networkPolicy(NetworkPolicy.NO_CACHE)
                    .into(binding.avatarImage)
            }
        }

        private fun updateList(){
            val list = currentList.toMutableList()
            list.removeAt(absoluteAdapterPosition)
            addUsersToAlbumFragment.adapter.notifyItemRemoved(absoluteAdapterPosition)
            addUsersToAlbumFragment.adapter.submitList(list)
            addUsersToAlbumFragment.updateJoinIsEmpty(list.isEmpty())
            addUsersToAlbumFragment.restartRefresh()
        }
    }
}

class UserJoinableDiffCallback : DiffUtil.ItemCallback<UserData>() {

    override fun areItemsTheSame(
        oldItem: UserData,
        newItem: UserData
    ): Boolean {
        return oldItem.userID == newItem.userID
    }

    override fun areContentsTheSame(
        oldItem: UserData,
        newItem: UserData
    ): Boolean {
        return oldItem == newItem
    }
}


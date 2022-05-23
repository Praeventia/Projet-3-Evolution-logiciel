package com.client_leger.colorimage.drawing.adapter

import com.client_leger.colorimage.album.data.UserData
import com.client_leger.colorimage.album.view_model.UserToAlbumViewModel
import com.client_leger.colorimage.databinding.ListUserInDrawingBinding
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.R
import com.client_leger.colorimage.drawing.ToolFragment
import com.squareup.picasso.MemoryPolicy
import com.squareup.picasso.NetworkPolicy
import com.squareup.picasso.Picasso

class UserInDrawingAdapters(val toolFragment: ToolFragment): ListAdapter<UserData, UserInDrawingAdapters.ViewHolderUser>(UserDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UserInDrawingAdapters.ViewHolderUser {
        return ViewHolderUser(
            DataBindingUtil.inflate(
                LayoutInflater.from(parent.context),
                R.layout.list_user_in_drawing,
                parent,
                false
            )
        )
    }

    override fun onBindViewHolder(holder: UserInDrawingAdapters.ViewHolderUser, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolderUser(private val binding : ListUserInDrawingBinding) : RecyclerView.ViewHolder(binding.root){

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
    }
}

class UserDiffCallback : DiffUtil.ItemCallback<UserData>() {

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

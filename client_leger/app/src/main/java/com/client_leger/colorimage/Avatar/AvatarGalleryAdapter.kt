package com.client_leger.colorimage.Avatar

import android.annotation.SuppressLint
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Avatar.Data.AvatarImageModel
import com.client_leger.colorimage.R
import com.squareup.picasso.Picasso
import de.hdodenhof.circleimageview.CircleImageView

class AvatarGalleryAdapter (private val avatarList: List<AvatarImageModel>): RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private lateinit var mListener: OnItemClickListener
    private var selectedItemPosition: Int = -1

    interface OnItemClickListener{
        fun onItemClick(position: Int)
    }

    fun setOnItemClickListener(listener: OnItemClickListener){
        mListener = listener
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.avatar_layout, parent, false)
        return ViewHolderAvatarGallery(itemView, mListener)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentItem = avatarList[position]
        Picasso.get().load(Constants.DEFAULT_AVATAR_URL + currentItem.imageResource).into((holder as ViewHolderAvatarGallery).imageView)

        if(selectedItemPosition == position && !avatarList[position].isSelected){
            avatarList[selectedItemPosition].isSelected = !avatarList[selectedItemPosition].isSelected
            holder.imageView.borderColor = Color.parseColor("#ffc866fa")
            holder.imageView.borderWidth = 5
        }
        else{
            avatarList[position].isSelected = false
            holder.imageView.borderColor = Color.TRANSPARENT
            holder.imageView.borderWidth = 5
        }
    }

    override fun getItemCount(): Int {
        return avatarList.size
    }

    @SuppressLint("NotifyDataSetChanged")
    inner class ViewHolderAvatarGallery(itemView: View, listener: OnItemClickListener): RecyclerView.ViewHolder(itemView){
        val imageView: CircleImageView = itemView.findViewById(R.id.avatar_image)
        init{
            itemView.setOnClickListener{
                listener.onItemClick(bindingAdapterPosition)
                selectedItemPosition = bindingAdapterPosition
                notifyDataSetChanged()
            }
        }
    }

}

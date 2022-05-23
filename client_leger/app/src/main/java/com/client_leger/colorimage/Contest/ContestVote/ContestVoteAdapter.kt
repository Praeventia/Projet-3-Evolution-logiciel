package com.client_leger.colorimage.Contest.ContestVote

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Contest.ContestVote.Data.ContestVoteData
import com.client_leger.colorimage.R
import org.w3c.dom.Text


class ContestVoteAdapter (private val drawingList: List<ContestVoteData>): RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private lateinit var mListener: OnItemClickListener
    private var selectedItemPosition: Int = -1
    private var buttonType: String = ""

    interface OnItemClickListener{
        fun onItemClick(position: Int, type: String)
    }

    fun setOnItemClickListener(listener: OnItemClickListener){
        mListener = listener
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.contest_vote, parent, false)
        return ViewHolderContestVoteGallery(itemView, mListener)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentItem = drawingList[position]
        (holder as ViewHolderContestVoteGallery).drawingView.setImageBitmap(currentItem.drawingBitmap)
        holder.drawingName.text = currentItem.drawingName
        holder.username.text = currentItem.username
        holder.vote.text = currentItem.vote

        if(currentItem.hasAlreadyUpVoted && !currentItem.hasAlreadyDownVoted){
            holder.like.alpha = 1F
            holder.dislike.alpha = 0.3F
        }
        else if(!currentItem.hasAlreadyUpVoted && currentItem.hasAlreadyDownVoted){
            holder.like.alpha = 0.3F
            holder.dislike.alpha = 1F
        }
        else{
            holder.like.alpha = 0.3F
            holder.dislike.alpha = 0.3F
        }

    }

    override fun getItemCount(): Int {
        return drawingList.size
    }

    @SuppressLint("NotifyDataSetChanged")
    inner class ViewHolderContestVoteGallery(itemView: View, listener: OnItemClickListener): RecyclerView.ViewHolder(itemView){

        val drawingView: ImageView = itemView.findViewById(R.id.drawing)
        var username: TextView = itemView.findViewById(R.id.username)
        var drawingName: TextView = itemView.findViewById(R.id.drawing_name)
        val like: TextView = itemView.findViewById(R.id.like)
        val dislike: TextView = itemView.findViewById(R.id.dislike)
        val vote: TextView = itemView.findViewById(R.id.vote)

        init{
            like.setOnClickListener{
                buttonType = "like"
                listener.onItemClick(bindingAdapterPosition, buttonType)
                selectedItemPosition = bindingAdapterPosition
                notifyDataSetChanged()
            }
            dislike.setOnClickListener{
                buttonType = "dislike"
                listener.onItemClick(bindingAdapterPosition, buttonType)
                selectedItemPosition = bindingAdapterPosition
                notifyDataSetChanged()
            }
        }
    }
}

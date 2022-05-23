package com.client_leger.colorimage.Contest.Participate

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Contest.Participate.Data.DrawingInfoData
import com.client_leger.colorimage.R

class ParticipateContestAdapter (private val drawingListForContest: List<DrawingInfoData>): RecyclerView.Adapter<RecyclerView.ViewHolder>() {
    private lateinit var mListener: OnItemClickListener
    private var selectedItemPosition: Int = -1

    interface OnItemClickListener{
        fun onItemClick(position: Int)
    }

    fun setOnItemClickListener(listener: OnItemClickListener){
        mListener = listener
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.contest_participate, parent, false)
        return ViewHolderContestVoteGallery(itemView, mListener)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentItem = drawingListForContest[position]
        (holder as ViewHolderContestVoteGallery).drawingView.setImageBitmap(currentItem.drawingBitmap)
        holder.drawingName.text = currentItem.drawingName

        if(selectedItemPosition == position && !drawingListForContest[position].isSelected){
            drawingListForContest[selectedItemPosition].isSelected = !drawingListForContest[selectedItemPosition].isSelected
            holder.selectedDrawing.visibility = View.VISIBLE
        }
        else{
            drawingListForContest[position].isSelected = false
            holder.selectedDrawing.visibility = View.GONE
        }
    }

    override fun getItemCount(): Int {
        return drawingListForContest.size
    }

    @SuppressLint("NotifyDataSetChanged")
    inner class ViewHolderContestVoteGallery(itemView: View, listener: OnItemClickListener): RecyclerView.ViewHolder(itemView){

        val drawingView: ImageView = itemView.findViewById(R.id.drawing)
        var drawingName: TextView = itemView.findViewById(R.id.drawing_name)
        var selectedDrawing: TextView = itemView.findViewById(R.id.selected_drawing)

        init{
            itemView.setOnClickListener{
                listener.onItemClick(bindingAdapterPosition)
                selectedItemPosition = bindingAdapterPosition
                notifyDataSetChanged()
            }
        }
    }
}

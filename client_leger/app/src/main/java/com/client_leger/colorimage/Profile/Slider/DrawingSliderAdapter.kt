package com.client_leger.colorimage.Profile.Slider

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Contest.ContestVote.ContestVoteAdapter
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.Profile.Slider.data.DrawingSliderData
import com.client_leger.colorimage.R
import de.hdodenhof.circleimageview.CircleImageView

class DrawingSliderAdapter (private val drawingList: List<DrawingSliderData>): RecyclerView.Adapter<RecyclerView.ViewHolder>(){

    private lateinit var mListener: OnItemClickListener
    private var selectedItemPosition: Int = -1

    interface OnItemClickListener{
        fun onItemClick(position: Int)
    }

    fun setOnItemClickListener(listener: OnItemClickListener){
        mListener = listener
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.slider_item, parent, false)
        return ViewHolderDrawingSlider(itemView, mListener)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentItem = drawingList[position]
        (holder as ViewHolderDrawingSlider).imageView.setImageBitmap(currentItem.imageView)
        holder.drawingName.text = currentItem.drawingTitle
        holder.ownerName.text = currentItem.ownerName
        holder.numberPeople.text = currentItem.numberPeople
        holder.creationDate.text = Timestamp.dateToDate(currentItem.creationDate)
        if (currentItem.locker) holder.locker.visibility = View.VISIBLE else holder.locker.visibility = View.GONE

    }

    override fun getItemCount(): Int {
        return drawingList.size
    }

    inner class ViewHolderDrawingSlider(itemView: View, listener: OnItemClickListener): RecyclerView.ViewHolder(itemView){
        val imageView: ImageView = itemView.findViewById(R.id.image_Album)
        val drawingName: TextView = itemView.findViewById(R.id.drawingName)
        val ownerName: TextView = itemView.findViewById(R.id.ownerName)
        val numberPeople: TextView = itemView.findViewById(R.id.numberPeople)
        val creationDate: TextView = itemView.findViewById(R.id.creationDate)
        val locker: ImageView = itemView.findViewById(R.id.locker)

        init{
            itemView.setOnClickListener{
                listener.onItemClick(bindingAdapterPosition)
                selectedItemPosition = bindingAdapterPosition
            }
        }
    }


}

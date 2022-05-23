package com.client_leger.colorimage.Contest.SubmitDrawing

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Contest.Participate.ParticipateContestAdapter
import com.client_leger.colorimage.Contest.SubmitDrawing.Data.SubmittedContestDrawingData
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.R


class SubmitContestDrawingAdapter (private val submittedContestDrawing: List<SubmittedContestDrawingData>): RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.contest_submitted, parent, false)
        return ViewHolderSubmitContestDrawing(itemView)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentItem = submittedContestDrawing[position]
        (holder as SubmitContestDrawingAdapter.ViewHolderSubmitContestDrawing).imageView.setImageBitmap(currentItem.imageBitmap)
        holder.drawingName.text =  currentItem.drawingName
        holder.vote.text =  currentItem.vote
        holder.date.text = Timestamp.dateToDateHour(currentItem.date)
        holder.theme.text = currentItem.theme
    }

    override fun getItemCount(): Int {
        return submittedContestDrawing.size
    }

    inner class ViewHolderSubmitContestDrawing(itemView: View): RecyclerView.ViewHolder(itemView){
        val imageView: ImageView = itemView.findViewById(R.id.submitted_drawing)
        val drawingName: TextView = itemView.findViewById(R.id.drawing_name)
        val vote: TextView = itemView.findViewById(R.id.vote)
        val date: TextView = itemView.findViewById(R.id.contest_date)
        val theme: TextView = itemView.findViewById(R.id.contest_theme)
    }
}

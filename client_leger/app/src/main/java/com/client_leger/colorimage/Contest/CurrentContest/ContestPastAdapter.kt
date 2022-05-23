package com.client_leger.colorimage.Contest.CurrentContest

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Contest.CurrentContest.Data.ContestData
import com.client_leger.colorimage.Contest.SubmitDrawing.SubmitContestDrawingAdapter
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.R
import com.squareup.picasso.Picasso
import org.w3c.dom.Text

class ContestPastAdapter (private val contestList: List<ContestData>): RecyclerView.Adapter<RecyclerView.ViewHolder>(){

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.contest_past_position, parent, false)
        return ViewHolderContest(itemView)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentItem = contestList[position]

        (holder as ViewHolderContest).theme.text = currentItem.theme
        holder.startDate.text = Timestamp.dateToDate(currentItem.startDate)
        holder.endDate.text = Timestamp.dateToDateHour(currentItem.endDate)
        holder.weekTitle.text = Constants.PAST_WEEK_CONTEST

        if(currentItem.podium?.first != null){
            holder.firstDrawing.setImageBitmap(currentItem.podium.first.imageBitmap)
            holder.firstUsername.text = currentItem.podium.first.username
            holder.firstDrawingName.text = currentItem.podium.first.drawingName
            holder.firstVote.text = currentItem.podium.first.vote
        }else{
            holder.firstWrapper.alpha = 0F
        }

        if(currentItem.podium?.second != null){
            holder.secondDrawing.setImageBitmap(currentItem.podium.second.imageBitmap)
            holder.secondUsername.text = currentItem.podium.second.username
            holder.secondDrawingName.text = currentItem.podium.second.drawingName
            holder.secondVote.text = currentItem.podium.second.vote
        }else{
            holder.secondWrapper.alpha = 0F
        }

        if(currentItem.podium?.third != null){
            holder.thirdDrawing.setImageBitmap(currentItem.podium.third.imageBitmap)
            holder.thirdUsername.text = currentItem.podium.third.username
            holder.thirdDrawingName.text = currentItem.podium.third.drawingName
            holder.thirdVote.text = currentItem.podium.third.vote
        }else{
            holder.thirdWrapper.alpha = 0F
        }

}

    override fun getItemCount(): Int {
        return contestList.size
    }

    inner class ViewHolderContest(itemView: View): RecyclerView.ViewHolder(itemView){
        val theme: TextView = itemView.findViewById(R.id.contest_theme)
        val startDate: TextView = itemView.findViewById(R.id.start_date)
        val endDate: TextView = itemView.findViewById(R.id.end_date)
        val weekTitle: TextView = itemView.findViewById(R.id.contest_week_title)

        val firstWrapper: LinearLayout = itemView.findViewById(R.id.first_place)
        val secondWrapper: LinearLayout = itemView.findViewById(R.id.second_place)
        val thirdWrapper: LinearLayout = itemView.findViewById(R.id.third_place)

        val firstUsername: TextView = itemView.findViewById(R.id.first_username)
        val secondUsername: TextView = itemView.findViewById(R.id.second_username)
        val thirdUsername: TextView = itemView.findViewById(R.id.third_username)

        val firstDrawingName: TextView = itemView.findViewById(R.id.first_drawing_name)
        val secondDrawingName: TextView = itemView.findViewById(R.id.second_drawing_name)
        val thirdDrawingName: TextView = itemView.findViewById(R.id.third_drawing_name)

        val firstDrawing: ImageView = itemView.findViewById(R.id.first_drawing)
        val secondDrawing: ImageView = itemView.findViewById(R.id.second_drawing)
        val thirdDrawing: ImageView = itemView.findViewById(R.id.third_drawing)

        val firstVote: TextView = itemView.findViewById(R.id.first_vote)
        val secondVote: TextView = itemView.findViewById(R.id.second_vote)
        val thirdVote: TextView = itemView.findViewById(R.id.third_vote)

    }
}

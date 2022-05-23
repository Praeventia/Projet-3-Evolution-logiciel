package com.client_leger.colorimage.Leaderboard

import android.annotation.SuppressLint
import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Leaderboard.data.LeaderboardData
import com.client_leger.colorimage.R
import com.squareup.picasso.Picasso
import de.hdodenhof.circleimageview.CircleImageView
import org.w3c.dom.Text

class LeaderboardAdapter (private val LeaderboardList: List<LeaderboardData>): RecyclerView.Adapter<RecyclerView.ViewHolder>(){

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.leaderboard, parent, false)
        return ViewHolderLeaderboard(itemView)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentItem = LeaderboardList[position]
        Picasso.get().load(currentItem.firstImageResource).into((holder as ViewHolderLeaderboard).firstProfile)
        Picasso.get().load(currentItem.secondImageResource).into(holder.secondProfile)
        Picasso.get().load(currentItem.thirdImageResource).into(holder.thirdProfile)

        holder.leaderboardName.text = currentItem.title
        holder.firstUsername.text = currentItem.firstUsername
        holder.secondUsername.text = currentItem.secondUsername
        holder.thirdUsername.text = currentItem.thirdUsername

    }

    override fun getItemCount(): Int {
        return LeaderboardList.size
    }

    @SuppressLint("NotifyDataSetChanged")
    inner class ViewHolderLeaderboard(itemView: View,): RecyclerView.ViewHolder(itemView){
        val firstProfile: CircleImageView = itemView.findViewById(R.id.first_image)
        val secondProfile: CircleImageView = itemView.findViewById(R.id.second_image)
        val thirdProfile: CircleImageView = itemView.findViewById(R.id.third_image)

        val leaderboardName: TextView = itemView.findViewById(R.id.leaderboard_name)
        val firstUsername: TextView = itemView.findViewById(R.id.first_username)
        val secondUsername: TextView = itemView.findViewById(R.id.second_username)
        val thirdUsername: TextView = itemView.findViewById(R.id.third_username)
    }
}

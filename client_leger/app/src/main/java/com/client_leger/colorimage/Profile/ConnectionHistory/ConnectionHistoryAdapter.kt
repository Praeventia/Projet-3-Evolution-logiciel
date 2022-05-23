package com.client_leger.colorimage.Profile.ConnectionHistory

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.Profile.ConnectionHistory.Data.ConnectionHistory
import com.client_leger.colorimage.R

class ConnectionHistoryAdapter(private val historyList: List<ConnectionHistory>): RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.connection_history, parent, false)
        return ViewHolderLoginHistory(itemView)
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val currentItem = historyList[position]
        val type = currentItem.type
        val date = Timestamp.dateToHourDate(currentItem.date)

        return (holder as ViewHolderLoginHistory).bind(type, date)
    }

    override fun getItemCount(): Int {
        return historyList.size
    }

    inner class ViewHolderLoginHistory(itemView: View, ): RecyclerView.ViewHolder(itemView){
        private val typeView: TextView = itemView.findViewById(R.id.type)
        private val dateView: TextView = itemView.findViewById(R.id.date)

        fun bind(typeRecyclerViewModel: String, dateRecyclerViewModel: String) {
            typeView.text = typeRecyclerViewModel.toString()
            dateView.text = dateRecyclerViewModel.toString()
        }
    }

}

package com.client_leger.colorimage.Chat.presentation.channels.components

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Filter
import android.widget.Filterable
import android.widget.TextView
import androidx.annotation.LayoutRes
import java.util.*

class AutocompleteChannelsAdapter(
    context: Context,
    @LayoutRes private val layoutResource: Int,
    private val allRooms: List<String>,
    private val onJoinRoomClick: (position: Int) -> Unit
) :
    ArrayAdapter<String>(context, layoutResource, allRooms),
    Filterable {
    var mRooms: List<String> = allRooms

    override fun getCount(): Int {
        return mRooms.size
    }

    override fun getItem(p0: Int): String {
        return mRooms[p0]
    }

    override fun getItemId(p0: Int): Long {
        return p0.toLong()
    }

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        val view: TextView = convertView as TextView? ?: LayoutInflater.from(context)
            .inflate(layoutResource, parent, false) as TextView
        view.text = mRooms[position]
        view.setOnClickListener {
            onJoinRoomClick(position)
        }
        return view
    }

    override fun getFilter(): Filter {
        return object : Filter() {
            override fun publishResults(charSequence: CharSequence?, filterResults: FilterResults) {
                mRooms = filterResults.values as List<String>
                notifyDataSetChanged()
            }

            override fun performFiltering(charSequence: CharSequence?): FilterResults {
                val queryString = charSequence?.toString()?.lowercase(Locale.getDefault())

                val filterResults = FilterResults()
                filterResults.values = if (queryString == null || queryString.isEmpty())
                    allRooms
                else
                    allRooms.filter {
                        it.lowercase(Locale.getDefault()).contains(queryString)
                    }
                return filterResults
            }
        }
    }
}

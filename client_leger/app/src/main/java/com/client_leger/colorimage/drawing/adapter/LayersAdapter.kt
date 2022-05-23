package com.client_leger.colorimage.drawing.adapter


import android.annotation.SuppressLint
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.databinding.DataBindingUtil
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.ListItemLayerBinding
import com.client_leger.colorimage.drawing.ToolFragment
import com.client_leger.colorimage.drawing.canvas_view.CanvasView
import com.client_leger.colorimage.drawing.data.LayersData
import com.client_leger.colorimage.drawing.services.HistoryService
import com.client_leger.colorimage.drawing.services.SelectionService
import com.client_leger.colorimage.drawing.view_model.LayersViewModel


class LayersAdapter(val toolFragment: ToolFragment): ListAdapter<LayersData, LayersAdapter.ViewHolderLayers>(LayerDiffCallback()) {

    var index = -1

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LayersAdapter.ViewHolderLayers {
        return ViewHolderLayers(
            DataBindingUtil.inflate(
                LayoutInflater.from(parent.context),
                R.layout.list_item_layer,
                parent,
                false
            )
        )
    }

    override fun onBindViewHolder(holder: LayersAdapter.ViewHolderLayers, position: Int) {
        holder.bind(getItem(position))

        if (index == position){
            holder.itemView.setBackgroundColor(Color.parseColor("#808080"))
        }
        else{
            holder.itemView.setBackgroundColor(Color.WHITE)
        }
    }

    @SuppressLint("NotifyDataSetChanged")
    inner class ViewHolderLayers(private val binding : ListItemLayerBinding) : RecyclerView.ViewHolder(binding.root){
        init {
            binding.setClickListener {
                if (index != absoluteAdapterPosition){
                    if(HistoryService.commandSelected[HistoryService.mainPathLists.size - 1 - absoluteAdapterPosition] == null) {

                        index = absoluteAdapterPosition
                        notifyDataSetChanged()

                        SelectionService.indexSelected =
                            HistoryService.mainPathLists.size - 1 - index

                        toolFragment.drawingActivity.canvasView.converter.selectCommand(
                            HistoryService.commandID[SelectionService.indexSelected]
                        )

                        toolFragment.drawingActivity.canvasView.oldDrawer = CanvasView.Drawer.NONE
                    }
                }
                else if (SelectionService.indexSelected != -1){
                    toolFragment.drawingActivity.canvasView.converter.unselectCommand(HistoryService.commandID[SelectionService.indexSelected])
                    toolFragment.drawingActivity.canvasView.oldDrawer = CanvasView.Drawer.NONE
                }
            }
        }

        fun bind(layer: LayersData){
            with(binding){
                viewModel = LayersViewModel(layer)
                if (layer.userId != null){
                    viewModel?.selectedBy = "Sélectionné par : ${layer.userId}"
                }
                else{
                    viewModel?.selectedBy = "Sélectionné par : "
                }

                val  stroke =  strokeColor.background as GradientDrawable
                stroke.color = ColorStateList.valueOf(viewModel?.strokeColor!!)
                val  fill =  fillColor.background as GradientDrawable
                fill.color = ColorStateList.valueOf(viewModel?.fillColor!!)

                executePendingBindings()
            }
        }
    }
}

class LayerDiffCallback : DiffUtil.ItemCallback<LayersData>() {

    override fun areItemsTheSame(
        oldItem: LayersData,
        newItem: LayersData
    ): Boolean {
        return oldItem.shapeType == newItem.shapeType
    }

    override fun areContentsTheSame(
        oldItem: LayersData,
        newItem: LayersData
    ): Boolean {
        return oldItem == newItem
    }
}

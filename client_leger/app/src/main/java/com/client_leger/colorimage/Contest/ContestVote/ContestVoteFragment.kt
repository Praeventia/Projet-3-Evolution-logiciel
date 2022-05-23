package com.client_leger.colorimage.Contest.ContestVote

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Contest.ContestVote.Intermediate.ServerContestVote
import com.client_leger.colorimage.Contest.ContestVote.Data.ContestVoteData
import com.client_leger.colorimage.Contest.ContestVote.Data.VoteUpdateData
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.Model.DrawingDecoder
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.FragmentContestVoteBinding
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class ContestVoteFragment : Fragment() {

    private var _binding: FragmentContestVoteBinding? = null
    private val binding get() = _binding!!

    private var drawingList:ArrayList<ContestVoteData>? = null
    private lateinit var adapter: ContestVoteAdapter


    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        _binding = FragmentContestVoteBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val loading = LoadingDialog(requireActivity())

        lifecycleScope.launch {
            loading.startLoadingDialog()
            numberOfVoteThisWeekByUser()
            drawingList = generateList()

            if(drawingList != null){
                binding.message.visibility = View.GONE
                binding.votesWrapper.alpha = 1F
                binding.recyclerWrapper.visibility = View.VISIBLE
                adapter = ContestVoteAdapter(drawingList!!)
                binding.recyclerContestVote.adapter = adapter
                binding.recyclerContestVote.layoutManager = GridLayoutManager(context, 3)
                binding.recyclerContestVote.setHasFixedSize(true)

                adapter.setOnItemClickListener(object : ContestVoteAdapter.OnItemClickListener {
                    @SuppressLint("NotifyDataSetChanged")
                    override fun onItemClick(position: Int, type: String) {
                        viewLifecycleOwner.lifecycleScope.launch {
                            updateList(position, type)
                            val item = updateItemInList(position)
                            drawingList!![position].hasAlreadyUpVoted = item.hasAlreadyUpVoted
                            drawingList!![position].hasAlreadyDownVoted = item.hasAlreadyDownVoted
                            drawingList!![position].vote = item.vote
                            adapter.notifyItemChanged(position)
                        }
                    }
                })
            }else{
                binding.message.visibility = View.VISIBLE
                binding.votesWrapper.alpha = 0F
                binding.recyclerWrapper.visibility = View.GONE
            }

            loading.dismissDialog()
        }
    }

    private suspend fun generateList(): ArrayList<ContestVoteData>?{
        return ServerContestVote.allEntryCurrentConcours()
    }

    private suspend fun updateList(position:Int, type:String){
        if(drawingList!![position].hasAlreadyUpVoted && type == "like"){
            removeUpVote(drawingList!![position])
        }
        else if(!drawingList!![position].hasAlreadyUpVoted && type == "like"){
            if(userCanStillVote()) {
                addUpVote(drawingList!![position])
            }
        }
        else if(drawingList!![position].hasAlreadyDownVoted && type == "dislike"){
            removeDownVote(drawingList!![position])
        }
        else if(!drawingList!![position].hasAlreadyDownVoted && type == "dislike"){
            if(userCanStillVote()) {
                addDownVote(drawingList!![position])
            }
        }
        numberOfVoteThisWeekByUser()
    }

    private suspend fun updateItemInList(position:Int) : VoteUpdateData {
        return ServerContestVote.updateItemInList(position)!!
    }

    private suspend fun userCanStillVote():Boolean{
        val responseData = ServerContestVote.userCanStillVote()
        return when(responseData.second == "succes"){
            true -> {
                if (responseData.first) true
                else {
                    Toast.makeText(context, Constants.CONTEST_MAX_VOTES_ACHIEVED, Toast.LENGTH_LONG)
                        .show()
                    false
                }
            }
            else -> {
                Toast.makeText(context, Constants.DEFAULT_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
                false
            }
        }

    }

    private suspend fun numberOfVoteThisWeekByUser(){
        val remainingVotes = ServerContestVote.numberOfUpVoteThisWeekByUser()
        if(remainingVotes == null) binding.availableVotes.text = Constants.ERROR
        else binding.availableVotes.text = remainingVotes.toString()
    }

    private suspend fun removeUpVote(drawing: ContestVoteData){
        val responsePair = ServerContestVote.unupvoteForEntry(drawing.id)
        when(responsePair.first){
            true -> return
            false -> {
                if(responsePair.second == Constants.CONFLICT_STATUS){
                    Toast.makeText(activity, Constants.VOTE_MODIFICATION_UNAVAILABLE, Toast.LENGTH_LONG).show()
                } else{
                    Toast.makeText(activity, Constants.DEFAULT_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
                }
            }
        }

    }

    private suspend fun addUpVote(drawing: ContestVoteData){
        val responsePair = ServerContestVote.voteForEntry(drawing.id)
        when(responsePair.first){
            true -> return
            false -> {
                if(responsePair.second == Constants.CONFLICT_STATUS){
                    Toast.makeText(activity, Constants.VOTE_MODIFICATION_UNAVAILABLE, Toast.LENGTH_LONG).show()
                } else{
                    Toast.makeText(activity, Constants.DEFAULT_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private suspend fun removeDownVote(drawing: ContestVoteData){
        val responsePair =  ServerContestVote.undownvoteForEntry(drawing.id)
        when(responsePair.first){
            true -> return
            false -> {
                if(responsePair.second == Constants.CONFLICT_STATUS){
                    Toast.makeText(activity, Constants.VOTE_MODIFICATION_UNAVAILABLE, Toast.LENGTH_LONG).show()
                } else{
                    Toast.makeText(activity, Constants.DEFAULT_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private suspend fun addDownVote(drawing: ContestVoteData){
        val responsePair =  ServerContestVote.downvoteForEntry(drawing.id)
        when(responsePair.first){
            true -> return
            false -> {
                if(responsePair.second == Constants.CONFLICT_STATUS){
                    Toast.makeText(activity, Constants.VOTE_MODIFICATION_UNAVAILABLE, Toast.LENGTH_LONG).show()
                } else{
                    Toast.makeText(activity, Constants.DEFAULT_ERROR_MESSAGE, Toast.LENGTH_LONG).show()
                }
            }
        }
    }



}

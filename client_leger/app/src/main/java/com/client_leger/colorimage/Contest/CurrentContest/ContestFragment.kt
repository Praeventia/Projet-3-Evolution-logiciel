package com.client_leger.colorimage.Contest.CurrentContest

import android.content.Intent
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.activity.addCallback
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.client_leger.colorimage.Avatar.Avatar
import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Chat.UnreadMessageTracker
import com.client_leger.colorimage.Chat.presentation.ChatActivity
import com.client_leger.colorimage.Constants.Constants
import com.client_leger.colorimage.Contest.CurrentContest.Data.ContestData
import com.client_leger.colorimage.Contest.CurrentContest.Intermediate.ContestServer
import com.client_leger.colorimage.Contest.CurrentContest.Data.WeekContestData
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.FragmentContestBinding
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch


class ContestFragment : Fragment() {

    private var _binding: FragmentContestBinding? = null
    private val binding get() = _binding!!

    private var contestInfo:ArrayList<ContestData>? = null
    private var pastContestInfo:ArrayList<ContestData>? = null

    private var adapter: RecyclerView.Adapter<RecyclerView.ViewHolder>? = null

    private lateinit var weekContestInfo:WeekContestData

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentContestBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        val loading = LoadingDialog(requireActivity())
        super.onViewCreated(view, savedInstanceState)

        lifecycleScope.launch {
            loading.startLoadingDialog()

            if (!User.isAuthorized()){
                User.hasBeenDisconnected = true
                User.disconnect()
                Avatar.clearAvatarList()
                SocketHandler.closeConnection()
                findNavController().navigate(R.id.action_ContestFragment_to_MainFragment)
                loading.dismissDialog()
                return@launch
            }

            contestInfo = generateDataList()
            pastContestInfo = generatePastDataList()

            if(contestInfo != null){
                binding.recyclerContest.visibility = View.VISIBLE
                binding.message.visibility = View.GONE
                adapter = ContestAdapter(contestInfo!!)
                binding.recyclerContest.adapter = adapter
                binding.recyclerContest.layoutManager = LinearLayoutManager(context)
                binding.recyclerContest.setHasFixedSize(true)
            }

            if(pastContestInfo != null){
                binding.recyclerPastContest.visibility = View.VISIBLE
                adapter = ContestPastAdapter(pastContestInfo!!)
                binding.recyclerPastContest.adapter = adapter
                binding.recyclerPastContest.layoutManager = GridLayoutManager(context, 1)
                binding.recyclerPastContest.setHasFixedSize(true)
            }

            if(contestInfo == null && pastContestInfo == null) {
                binding.recyclerContest.visibility = View.GONE
                binding.recyclerPastContest.visibility = View.GONE
                binding.message.visibility = View.VISIBLE
                binding.message.text = Constants.NO_CONTEST
            }

            loading.dismissDialog()

            if(User.userIsAuthenticated()){
                (view.findViewById(R.id.chat_info) as View).visibility = View.VISIBLE
                listenUnreadMessages()
            }else{
                (getView()?.findViewById(R.id.chat_info) as View).visibility = View.GONE
            }

            (getView()?.findViewById(R.id.chat_info) as View).setOnClickListener {
                activity?.let{
                    val intent = Intent (it, ChatActivity::class.java)
                    it.startActivity(intent)
                }
            }

        }

        binding.vote.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                if (!User.isAuthorized()) {
                    User.hasBeenDisconnected = true
                    User.disconnect()
                    Avatar.clearAvatarList()
                    SocketHandler.closeConnection()
                    findNavController().navigate(R.id.action_ContestFragment_to_MainFragment)
                    return@launch
                }
                findNavController().navigate(R.id.action_ContestFragment_to_ContestVoteFragment)
            }
        }

        binding.mySubmissions.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                if (!User.isAuthorized()) {
                    User.hasBeenDisconnected = true
                    User.disconnect()
                    Avatar.clearAvatarList()
                    SocketHandler.closeConnection()
                    findNavController().navigate(R.id.action_ContestFragment_to_MainFragment)
                    return@launch
                }
                findNavController().navigate(R.id.action_ContestFragment_to_SubmitContestDrawingFragment)
            }
        }

        binding.participate.setOnClickListener {
            viewLifecycleOwner.lifecycleScope.launch {
                if (!User.isAuthorized()) {
                    User.hasBeenDisconnected = true
                    User.disconnect()
                    Avatar.clearAvatarList()
                    SocketHandler.closeConnection()
                    findNavController().navigate(R.id.action_ContestFragment_to_MainFragment)
                    return@launch
                }
                findNavController().navigate(R.id.action_ContestFragment_to_ParticipateContestFragment)
            }
        }

        requireActivity().onBackPressedDispatcher.addCallback(viewLifecycleOwner) {
            findNavController().navigate(R.id.action_ContestFragment_to_MainFragment)
        }

    }

    private suspend fun generateDataList(): ArrayList<ContestData>?{
        return ContestServer.topEntryCurrentConcours()
    }

    private suspend fun generatePastDataList(): ArrayList<ContestData>?{
        val list = ContestServer.topEntryPastConcours()
        return if (list != null && list.size == 0) {
            null
        } else list
    }

    private fun listenUnreadMessages() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                UnreadMessageTracker.unreadMessagesState.onEach {
                    updateUnreadBadge(it.unreadMessagesChannels)
                }.collect()
            }
        }
    }

    private fun updateUnreadBadge(list : Map<String,Int>) {
        val unreadMessages = list.values.sum()

        val messageBadge = view?.findViewById<TextView>(R.id.new_message_badge)

        if (unreadMessages > 0) {
            messageBadge!!.visibility  = View.VISIBLE
            messageBadge.text = unreadMessages.toString()
        }
        else {
            messageBadge!!.visibility  = View.INVISIBLE
        }
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }


}


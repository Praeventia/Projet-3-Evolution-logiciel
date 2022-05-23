package com.client_leger.colorimage.Profile.ConnectionHistory

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.lifecycleScope
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import com.client_leger.colorimage.Chat.SocketHandler
import com.client_leger.colorimage.Avatar.Avatar
import com.client_leger.colorimage.Model.Timestamp
import com.client_leger.colorimage.Model.User
import com.client_leger.colorimage.Profile.ConnectionHistory.Data.ConnectionHistory
import com.client_leger.colorimage.R
import com.client_leger.colorimage.databinding.FragmentConnectionHistoryBinding
import kotlinx.coroutines.launch


class ConnectionHistoryFragment : DialogFragment() {

    private var _binding: FragmentConnectionHistoryBinding? = null
    private val binding get() = _binding!!

    private var loginHistoryList:List<ConnectionHistory>? = generateHistoryList()
    private val adapter = loginHistoryList?.let { ConnectionHistoryAdapter(it) }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentConnectionHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        lifecycleScope.launch {
            if (!User.isAuthorized()){
                User.hasBeenDisconnected = true
                User.disconnect()
                Avatar.clearAvatarList()
                SocketHandler.closeConnection()
                dismiss()
                findNavController().navigate(R.id.action_ProfileFragment_to_MainFragment)
            }
        }

        binding.recyclerLoginHistory.adapter = adapter
        binding.recyclerLoginHistory.layoutManager = GridLayoutManager(context, 1)
        binding.recyclerLoginHistory.setHasFixedSize(false)

    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun generateHistoryList(): List<ConnectionHistory> {
        val connectionHistory = User.getLoginHistory()
        val disconnectHistory = User.getDisconnectHistory()
        val history:MutableList<ConnectionHistory> = mutableListOf<ConnectionHistory>()
        if (connectionHistory != null) {
            for (i in 0 until connectionHistory.length()) {
                history.add(ConnectionHistory("Connexion", Timestamp.stringToDate(connectionHistory[i].toString())))
            }
        }
        if (disconnectHistory != null) {
            for (i in 0 until disconnectHistory.length()) {
                history.add(ConnectionHistory("Déconnexion", Timestamp.stringToDate(disconnectHistory[i].toString())))
            }
        }
        return history.sortedByDescending { ConnectionHistory -> ConnectionHistory.date }

    }

}

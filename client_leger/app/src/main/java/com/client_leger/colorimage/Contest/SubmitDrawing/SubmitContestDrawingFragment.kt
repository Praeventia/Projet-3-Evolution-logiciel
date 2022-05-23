package com.client_leger.colorimage.Contest.SubmitDrawing

import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import com.client_leger.colorimage.Contest.SubmitDrawing.Intermediate.SubmitContestDrawingServer
import com.client_leger.colorimage.Contest.SubmitDrawing.Data.SubmittedContestDrawingData
import com.client_leger.colorimage.Loading.LoadingDialog
import com.client_leger.colorimage.databinding.FragmentSubmitContestDrawingBinding
import kotlinx.coroutines.launch


class SubmitContestDrawingFragment : Fragment() {

    private var _binding: FragmentSubmitContestDrawingBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        _binding = FragmentSubmitContestDrawingBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        val loading = LoadingDialog(requireActivity())

        lifecycleScope.launch {
            loading.startLoadingDialog()
            val currentWeekContest:ArrayList<SubmittedContestDrawingData>? = generateCurrentEntryByUser()
            if(currentWeekContest == null){
                binding.noDrawing.visibility = View.VISIBLE
                binding.recyclerCurrentWeekContest.visibility = View.GONE
            }else{
                binding.noDrawing.visibility = View.GONE
                binding.recyclerCurrentWeekContest.visibility = View.VISIBLE
                val currentWeekAdapter = SubmitContestDrawingAdapter(currentWeekContest)
                binding.recyclerCurrentWeekContest.adapter = currentWeekAdapter
                binding.recyclerCurrentWeekContest.layoutManager = LinearLayoutManager(context)
                binding.recyclerCurrentWeekContest.setHasFixedSize(true)
            }

            val passedWeekContest: ArrayList<SubmittedContestDrawingData>? = generatePastWeekDrawingList()
            if(passedWeekContest == null){
                binding.noPastDrawing.visibility = View.VISIBLE
                binding.recyclerPastWeekContest.visibility = View.GONE
            }else {
                binding.noPastDrawing.visibility = View.GONE
                binding.recyclerPastWeekContest.visibility = View.VISIBLE
                val passedWeekAdapter = SubmitContestDrawingAdapter(passedWeekContest)
                binding.recyclerPastWeekContest.adapter = passedWeekAdapter
                binding.recyclerPastWeekContest.layoutManager = GridLayoutManager(context, 2)
                binding.recyclerPastWeekContest.setHasFixedSize(true)
            }

            loading.dismissDialog()

        }
    }

    private suspend fun generateCurrentEntryByUser(): ArrayList<SubmittedContestDrawingData>? {
        return SubmitContestDrawingServer.getCurrentEntryByUser()
    }

    private suspend fun generatePastWeekDrawingList(): ArrayList<SubmittedContestDrawingData>? {
        return SubmitContestDrawingServer.allPastEntryByUser()
    }

}

package com.client_leger.colorimage.album.adapter

import androidx.fragment.app.Fragment
import androidx.viewpager2.adapter.FragmentStateAdapter
import com.client_leger.colorimage.album.AlbumJoinableFragment
import com.client_leger.colorimage.album.AlbumExpositionFragment
import com.client_leger.colorimage.album.AlbumUserFragment

const val MY_ALBUM_PAGE_INDEX = 0
const val ALBUMS_LIST_PAGE_INDEX = 1
const val ALBUMS_SHARE_PAGE_INDEX = 2

class AlbumPagerAdapter(fragment: Fragment) : FragmentStateAdapter(fragment){

    private val tabFragmentCreator: Map<Int, ()->Fragment> = mapOf(
        MY_ALBUM_PAGE_INDEX to { AlbumUserFragment() },
        ALBUMS_LIST_PAGE_INDEX to { AlbumJoinableFragment() },
        ALBUMS_SHARE_PAGE_INDEX to { AlbumExpositionFragment() }
    )

    override fun getItemCount(): Int {
        return tabFragmentCreator.size
    }

    override fun createFragment(position: Int): Fragment {
        return tabFragmentCreator[position]?.invoke() ?: throw IndexOutOfBoundsException()
    }
}

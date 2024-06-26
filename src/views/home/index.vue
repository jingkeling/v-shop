<script lang="ts">
export default {
  name: 'Home',
};
</script>

<script lang="ts" setup>
import { onMounted, ref, unref } from 'vue';
import { useRouter } from 'vue-router';
import API_GOODS from '@/apis/goods';
import API_BANNER from '@/apis/banner';
import IMAGE_LIST_EMPTY from '@/assets/images/empty/good.png';
import { computed } from 'vue';
import { Dialog } from 'vant';
import { nextTick } from 'vue';

onMounted(async () => {
  getBannerList();
  onPage();
  await Dialog({
    title: '亲爱的审核员',
    message: '这不是购物网站，这只是用来展示编程技术成果的网站，没有任何实际的购买支付环节，仅用于交流学习（不售卖物品、不需要支付功能，因此不需要资质）',
  });
  await Dialog({
    message: '备案号在网页底部',
  });
  scrollToBottom()
});

const router = useRouter();

const bannerList = ref<Recordable[]>([]);

function getBannerList() {
  API_BANNER.bannerList({ type: 'indexBanner' }).then((res) => {
    // bannerList.value = res.data || [];
    bannerList.value = res.data || [];
    bannerList.value = bannerList.value.filter((_, index) => index < 1)
  });
}

function onBannerClicked(linkUrl: string) {
  if (linkUrl) {
    window.location.href = linkUrl;
  }
}

const list = ref<Recordable[]>([]);
const listLoading = ref(false);
const listFinished = ref(false);
const listError = ref(false);
const listFinishedText = ref('没有更多了--');
const listErrorText = ref('请求失败，点击重新加载');
const listEmptyText = ref('暂无商品');
const listEmptyImage = IMAGE_LIST_EMPTY;
const pageCurrent = ref(1);
const pageSize = ref(10);

function onPageLoad() {
  if (unref(listFinished)) {
    return;
  }

  pageCurrent.value += 1;
  onPage();
}

function onPage() {
  listLoading.value = true;

  const params = {
    page: unref(pageCurrent),
    pageSize: unref(pageSize),
  };

  API_GOODS.goodsList(params)
    .then((res) => {
      const records = res.data?.result ?? [];
      const total = res.data?.totalRow ?? 0;

      // list.value = unref(pageCurrent) === 1 ? records : unref(list).concat(records);
      list.value = unref(pageCurrent) === 1 ? records : unref(list).concat(records)
      list.value = list.value.filter((_, index) => index < 2)
      listLoading.value = false;
      listFinished.value = list.value.length >= total;
    })
    .catch((error) => {
      console.error(error);
      listLoading.value = false;
      listError.value = true;
    });
}

function onGoodClicked(id: number) {
  router.push({ path: '/good/detail', query: { id } });
}
// 备案号
const icp = computed(() => {
  return import.meta.env.VITE_ICP;
})

const scrollTarget = ref()
const scrollToBottom =  ()=> {
  nextTick(() => {
    scrollTarget.value.scrollIntoView({ behavior: 'smooth' });
  })
}


</script>

<template>
  <div class="container">
    <div class="swiper">
      <van-swipe :autoplay="5000" class="swiper">
        <van-swipe-item
          v-for="item in bannerList"
          :key="item.id"
          class="swiper-item"
          @click="onBannerClicked(item.linkUrl)"
        >
          <van-image class="swiper-item-img" fit="cover" :src="item.picUrl" :alt="item.title" />
        </van-swipe-item>
      </van-swipe>
    </div>
    <div class="main">
      <Plate class="section-header" title="商品列表" />
      <van-list
        v-model:loading="listLoading"
        v-model:error="listError"
        class="list"
        :finished="listFinished"
        :finished-text="listFinishedText"
        :error-text="listErrorText"
        :immediate-check="false"
        @load="onPageLoad"
      >
        <div v-for="item in list" :key="item.id" class="list-col">
          <div class="list-item" @click="onGoodClicked(item.id)">
            <div v-if="item.recommendStatus" class="list-item-badge">推荐</div>
            <van-image class="list-item-photo" :src="item.pic" :alt="item.name" />
            <div class="list-item-info">
              <div class="list-item-title">{{ item.name }}</div>
              <div class="list-item-price">
                <div class="price">
                  <div class="price-current">
                    <span class="price-current-symbol">¥</span>
                    <span class="price-current-integer">{{ item.minPrice }}</span>
                  </div>
                  <div v-if="item.originalPrice > 0" class="price-origin">
                    <span class="price-origin-symbol">¥</span>
                    <span class="price-origin-integer">{{ item.originalPrice }}</span>
                  </div>
                </div>
                <van-button type="primary" plain class="buy-btn">购买</van-button>
              </div>
            </div>
          </div>
        </div>
        <template #finished>
          <div v-if="list.length">{{ listFinishedText }}
            <div ref="scrollTarget">
              <div style="color: red;">本网站仅用于编程开发技术分享，展示我开发商品网站的能力，不是购物网站～</div>
              <p style=""><a class="text-color" href="https://beian.miit.gov.cn/" target="_blank">{{ icp }}</a></p>
            </div>
          </div>
          <van-empty v-else :image="listEmptyImage" :description="listEmptyText" />
        </template>
      </van-list>
    </div>
    <!-- 底部导航栏 -->
    <Tabbar />
  </div>
</template>

<style lang="less" scoped>
.swiper {
  width: 100%;
  height: 180px;
  margin-bottom: 10px;

  &-item,
  &-item-img {
    width: 100%;
    height: 100%;
  }
}

.list {
  display: flex;
  flex-wrap: wrap;
  padding-left: 5px;
  padding-right: 5px;

  :deep(.van-list__loading),
  :deep(.van-list__finished-text),
  :deep(.van-list__error-text) {
    width: 100%;
  }

  &-col {
    width: 50%;
    box-sizing: border-box;
    padding-left: 5px;
    padding-right: 5px;
    margin-bottom: 10px;
  }

  &-item {
    position: relative;
    text-align: left;
    overflow: hidden;
    background: var(--white);
    border-radius: 8px;
    // box-shadow: 0px 2px 4px 3px rgba(243, 243, 243, 0.5);

    &-badge {
      position: absolute;
      top: 15px;
      left: 0;
      z-index: 20;
      display: inline-block;
      padding: 2px 4px;
      color: var(--white);
      background-color: var(--red-color);
      font-size: 10px;
      line-height: normal;
      border-radius: 0 8px 8px 0;
      padding-right: 6px;
    }

    &-photo {
      display: flex;
      width: 100%;
      height: 172px;
    }

    &-info {
      padding: 5px 10px;
    }

    &-title {
      font-size: 14px;
      color: var(--gray-color-8);
      min-height: 36px;
      line-height: 18px;
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    &-price {
      margin-top: 5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .buy-btn {
      height: 24px;
      padding: 0 8px;
      line-height: 24px;
    }

    .price {
      display: flex;
      align-items: center;

      &-current {
        margin-right: 5px;
        color: var(--brand-color);

        &-symbol {
          font-size: 12px;
          margin-right: 2px;
        }

        &-integer {
          font-size: 18px;
          font-family: @font-family-price-integer;
        }
      }

      &-origin {
        font-size: 12px;
        text-decoration: line-through;
        color: var(--gray-color-6);

        &-label {
          margin-right: 2px;
        }

        &-integer {
          text-decoration: line-through;
          font-family: @font-family-price-integer;
        }
      }
    }
  }
}
</style>

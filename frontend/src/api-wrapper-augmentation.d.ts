import Vue from 'vue'

declare module 'vue/types/vue' {
    interface Vue {
        readonly $api: import('api-client-wrapper').APIWrapper;
    }
}